import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_URL } from "../api";

export default function Offers() {
  const location = useLocation();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState("");

  const applicationId =
    location.state?.applicationId ??
    location.state?.application?.id ??
    new URLSearchParams(location.search).get("application_id");

  function getUserId() {
    try {
      const user = JSON.parse(
        localStorage.getItem("easyloan_user") || "null"
      );

      return user?.id ?? user?.user_id ?? null;
    } catch {
      return null;
    }
  }

  function getHeaders() {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("token");

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async function getErrorMessage(response) {
    const data = await response.json().catch(() => null);

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((item) => item.msg)
        .join(", ");
    }

    return `Request failed with status ${response.status}`;
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchOffers() {
      setLoading(true);
      setError("");

      try {
        if (!applicationId) {
          throw new Error(
            "Please select a loan application first."
          );
        }

        const userId = getUserId();

        if (!userId) {
          throw new Error(
            "User ID not found. Please login again."
          );
        }

        const response = await fetch(
          `${API_URL}/offers/application/${encodeURIComponent(applicationId)}?user_id=${encodeURIComponent(userId)}`,
          {
            method: "GET",
            headers: getHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(response)
          );
        }

        const data = await response.json();

        const receivedOffers = Array.isArray(data)
          ? data
          : Array.isArray(data.offers)
            ? data.offers
            : Array.isArray(data.data)
              ? data.data
              : [];

        if (!cancelled) {
          setOffers(receivedOffers);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching offers:", err);
          setError(
            err.message || "Unable to load loan offers."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchOffers();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  async function handleSelectOffer(offer) {
    const offerId = offer.id ?? offer.offer_id;

    if (!offerId) {
      setMessage("Offer ID is missing.");
      return;
    }

    const userId = getUserId();

    if (!userId) {
      setMessage("User ID not found. Please login again.");
      return;
    }

    setActionLoading(offerId);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/offers/${encodeURIComponent(offerId)}/select?user_id=${encodeURIComponent(userId)}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response)
        );
      }

      const updatedOffer = await response.json();

      setOffers((currentOffers) =>
        currentOffers.map((item) =>
          (item.id ?? item.offer_id) === offerId
            ? { ...item, ...updatedOffer }
            : item
        )
      );

      setMessage("Loan offer accepted successfully.");
    } catch (err) {
      console.error("Error accepting offer:", err);
      setMessage(
        err.message || "Could not accept this offer."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectOffer(offer) {
    const offerId = offer.id ?? offer.offer_id;

    if (!offerId) {
      setMessage("Offer ID is missing.");
      return;
    }

    const userId = getUserId();

    if (!userId) {
      setMessage("User ID not found. Please login again.");
      return;
    }

    setActionLoading(offerId);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/offers/${encodeURIComponent(offerId)}/reject?user_id=${encodeURIComponent(userId)}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response)
        );
      }

      const updatedOffer = await response.json();

      setOffers((currentOffers) =>
        currentOffers.map((item) =>
          (item.id ?? item.offer_id) === offerId
            ? { ...item, ...updatedOffer }
            : item
        )
      );

      setMessage("Loan offer rejected successfully.");
    } catch (err) {
      console.error("Error rejecting offer:", err);
      setMessage(
        err.message || "Could not reject this offer."
      );
    } finally {
      setActionLoading(null);
    }
  }

  function formatCurrency(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return "Not specified";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function getOfferStatus(offer) {
    return String(
      offer.status || "PENDING"
    ).toUpperCase();
  }

  function getOfferId(offer) {
    return offer.id ?? offer.offer_id;
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              EasyLoan
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Your Loan Offers
            </h1>

            <p className="mt-3 max-w-2xl text-gray-600">
              Compare available loan offers and review their terms before
              making a decision.
            </p>
          </div>

          {applicationId && (
            <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              Application ID: {applicationId}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
            >
              {message}
            </div>
          )}

          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              <p className="mt-4 text-gray-600">
                Loading loan offers...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
              <p className="font-semibold text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : offers.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <div className="text-4xl" aria-hidden="true">
                🏦
              </div>

              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                No loan offers available yet
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-gray-600">
                There are no offers to display right now. Please check again
                later or review your loan application.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

              {offers.map((offer, index) => {
                const offerId = getOfferId(offer);
                const status = getOfferStatus(offer);

                const isAccepted = status === "ACCEPTED";
                const isRejected = status === "REJECTED";
                const isBusy = actionLoading === offerId;

                const lenderName =
                  offer.lender_name ||
                  offer.lender?.name ||
                  offer.bank_name ||
                  offer.bank ||
                  "Loan Provider";

                const interestRate =
                  offer.interest_rate_percentage ??
                  offer.interest_rate ??
                  offer.interestRate;

                const loanAmount =
                  offer.offered_amount ??
                  offer.loan_amount ??
                  offer.amount ??
                  offer.approved_amount;

                const tenure =
                  offer.tenure_months ??
                  offer.tenure ??
                  offer.loan_tenure;

                const processingFee =
                  offer.processing_fees ??
                  offer.processing_fee ??
                  offer.processingFee;

                return (
                  <article
                    key={offerId ?? index}
                    className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">
                          Lender
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-gray-900">
                          {lenderName}
                        </h2>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          isAccepted
                            ? "bg-green-100 text-green-800"
                            : isRejected
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div className="mt-6 rounded-lg bg-gray-50 p-4">
                      <p className="text-sm text-gray-500">
                        Loan Amount
                      </p>

                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {formatCurrency(loanAmount)}
                      </p>
                    </div>

                    <dl className="mt-5 space-y-4">

                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-sm text-gray-600">
                          Interest Rate
                        </dt>

                        <dd className="text-sm font-semibold text-gray-900">
                          {interestRate != null
                            ? `${interestRate}%`
                            : "Not specified"}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-sm text-gray-600">
                          Tenure
                        </dt>

                        <dd className="text-sm font-semibold text-gray-900">
                          {tenure != null
                            ? `${tenure} months`
                            : "Not specified"}
                        </dd>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-sm text-gray-600">
                          Processing Fee
                        </dt>

                        <dd className="text-sm font-semibold text-gray-900">
                          {processingFee != null
                            ? formatCurrency(processingFee)
                            : "Not specified"}
                        </dd>
                      </div>

                    </dl>

                    <div className="mt-auto flex flex-col gap-3 pt-6">

                      {!isAccepted && !isRejected && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSelectOffer(offer)}
                            disabled={isBusy || !offerId}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isBusy ? "Please wait..." : "Accept Offer"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectOffer(offer)}
                            disabled={isBusy || !offerId}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject Offer
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <div className="rounded-lg bg-green-50 p-3 text-center text-sm font-medium text-green-800">
                          You accepted this offer.
                        </div>
                      )}

                      {isRejected && (
                        <div className="rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-800">
                          You rejected this offer.
                        </div>
                      )}

                    </div>
                  </article>
                );
              })}

            </div>
          )}

          <p className="mt-8 text-xs leading-5 text-gray-500">
            Please verify the interest rate, fees, eligibility, and repayment
            terms with the lender before accepting any offer. Displayed offers
            are not a guarantee of final loan approval.
          </p>

        </div>
      </main>

      <Footer />
    </>
  );
}