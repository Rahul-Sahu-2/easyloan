
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_URL = "http://127.0.0.1:8000/api/v1";

const statusStyles = {
  "under review": "bg-amber-100 text-amber-800",
  pending: "bg-amber-100 text-amber-800",
  submitted: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function StatusBadge({ status }) {
  const normalized = String(status || "Unknown").replaceAll("_", " ");
  const style =
    statusStyles[normalized.toLowerCase()] ||
    "bg-gray-100 text-gray-700";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${style}`}>
      {normalized}
    </span>
  );
}

function SummaryCard({ title, count, description }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{count}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function formatAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "Not available";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(data, status) {
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((item) => item.msg).join(", ");
  }
  if (status === 401 || status === 403) {
    return "The backend requires authentication before showing your applications.";
  }
  return "Could not load applications. Please try again.";
}

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApplications() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/applications/me`, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(getErrorMessage(data, response.status));
        }

        // Accept common API response shapes without inventing records.
        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data?.applications)
            ? data.applications
            : Array.isArray(data?.items)
              ? data.items
              : null;

        if (!rows) {
          throw new Error(
            "The API responded, but its application data format was unexpected."
          );
        }

        setApplications(rows);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message === "Failed to fetch"
              ? "Cannot reach the backend. Make sure FastAPI is running."
              : err.message
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadApplications();

    return () => controller.abort();
  }, []);

  const getStatus = (app) =>
    app.status || app.application_status || "Unknown";

  const getAmount = (app) =>
    app.loan_amount ?? app.requested_amount ?? app.amount;

  const getLoanType = (app) =>
    app.loan_type || app.loan_purpose || app.loan_category || "Loan";

  const getDate = (app) =>
    app.created_at || app.application_date || app.date_applied;

  const getId = (app) =>
    app.id ?? app.application_id ?? app.reference_id ?? "—";

  const underReview = applications.filter((app) =>
    ["under review", "pending", "submitted", "processing"].includes(
      String(getStatus(app)).replaceAll("_", " ").toLowerCase()
    )
  ).length;

  const approved = applications.filter(
    (app) => String(getStatus(app)).toLowerCase() === "approved"
  ).length;

  const rejected = applications.filter(
    (app) => String(getStatus(app)).toLowerCase() === "rejected"
  ).length;

  function viewDetails(application) {
    setSelectedApplication(application);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              My Applications
            </h1>
            <p className="mt-2 text-gray-600">
              View and track your loan application details.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-900">
                Unable to load applications
              </p>
              <p className="mt-1 text-sm text-red-800">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          )}

          <section
            aria-label="Application summary"
            className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            <SummaryCard
              title="Total Applications"
              count={isLoading ? "…" : applications.length}
              description="From the backend"
            />
            <SummaryCard
              title="Under Review"
              count={isLoading ? "…" : underReview}
              description="Current records"
            />
            <SummaryCard
              title="Approved"
              count={isLoading ? "…" : approved}
              description="Current records"
            />
            <SummaryCard
              title="Rejected"
              count={isLoading ? "…" : rejected}
              description="Current records"
            />
          </section>

          {selectedApplication && (
            <section className="mb-6 rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Application details
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    ID: {String(getId(selectedApplication))}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                  Close
                </button>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-700">
                {JSON.stringify(selectedApplication, null, 2)}
              </pre>
            </section>
          )}

          <section className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Applications
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Application records returned by EasyLoan.
              </p>
            </div>

            {isLoading ? (
              <p className="p-8 text-center text-gray-500">
                Loading your applications…
              </p>
            ) : applications.length === 0 && !error ? (
              <div className="p-10 text-center">
                <p className="font-semibold text-gray-800">
                  No applications found
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Your submitted applications will appear here when available.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Application ID</th>
                      <th className="px-6 py-4">Loan Type</th>
                      <th className="px-6 py-4">Requested Amount</th>
                      <th className="px-6 py-4">Date Applied</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications.map((app, index) => (
                      <tr key={getId(app) === "—" ? index : getId(app)}>
                        <td className="whitespace-nowrap px-6 py-5 font-medium text-gray-900">
                          {String(getId(app))}
                        </td>
                        <td className="px-6 py-5 text-gray-600">
                          {String(getLoanType(app))}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5 font-medium">
                          {formatAmount(getAmount(app))}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5 text-gray-600">
                          {formatDate(getDate(app))}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5">
                          <StatusBadge status={getStatus(app)} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-5">
                          <button
                            type="button"
                            onClick={() => viewDetails(app)}
                            className="font-semibold text-blue-700 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="space-y-4 md:hidden">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Applications
            </h2>

            {isLoading ? (
              <p className="rounded-xl bg-white p-6 text-gray-500">
                Loading your applications…
              </p>
            ) : applications.length === 0 && !error ? (
              <div className="rounded-xl bg-white p-6 text-center">
                <p className="font-semibold">No applications found</p>
                <p className="mt-2 text-sm text-gray-500">
                  Your applications will appear here when available.
                </p>
              </div>
            ) : (
              applications.map((app, index) => (
                <article
                  key={getId(app) === "—" ? index : getId(app)}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Application ID</p>
                      <p className="mt-1 font-semibold">{String(getId(app))}</p>
                    </div>
                    <StatusBadge status={getStatus(app)} />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Loan Type</p>
                      <p className="mt-1 text-sm font-medium">
                        {String(getLoanType(app))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date Applied</p>
                      <p className="mt-1 text-sm font-medium">
                        {formatDate(getDate(app))}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Requested Amount</p>
                      <p className="mt-1 text-xl font-bold">
                        {formatAmount(getAmount(app))}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => viewDetails(app)}
                    className="mt-5 w-full rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                  >
                    View Details
                  </button>
                </article>
              ))
            )}
          </section>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-gray-900">
                Looking for a loan?
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Start a new application.
              </p>
            </div>
            <Link
              to="/apply"
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 sm:w-auto"
            >
              Start an Application
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MyApplications;
