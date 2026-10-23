
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = "http://127.0.0.1:8000/api/v1";

function Offers() {
  const location = useLocation();
  const application = location.state?.application;

  const applicationId =
    application?.id ?? application?.application_id;

  const user = JSON.parse(
    localStorage.getItem("easyloan_user") || "null"
  );
  const userId = user?.id;

  const requestedAmount =
    Number(application?.requested_amount ?? application?.loanAmount) || 0;

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectingOfferId, setSelectingOfferId] = useState(null);
  const [rejectingOfferId, setRejectingOfferId] = useState(null);
  const [selectionMessage, setSelectionMessage] = useState("");
  const [selectionError, setSelectionError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchOffers() {
      if (!applicationId || !userId) {
        setError(
          "Application details are missing. Please log in and open offers from your submitted application."
        );
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/offers/application/${applicationId}?user_id=${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load loan offers.");
        }

        if (!cancelled) {
          setOffers(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not connect to the backend.");
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
  }, [applicationId, userId]);

  const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

  async function handleSelectOffer(offer) {
    if (!userId || !applicationId) {
      setSelectionError(
        "Your user or application details are missing. Please log in again."
      );
      setSelectionMessage("");
      return;
    }

    if (offer.status === "ACCEPTED") {
      setSelectionMessage("You have already selected this offer.");
      setSelectionError("");
      return;
    }

    if (offer.status !== "PENDING") {
      setSelectionError(
        `This offer cannot be selected because its status is ${offer.status}.`
      );
      setSelectionMessage("");
      return;
    }

    const anotherAcceptedOffer = offers.some(
      (item) =>
        item.application_id === offer.application_id &&
        item.status === "ACCEPTED"
    );

    if (anotherAcceptedOffer) {
      setSelectionError(
        "An offer has already been selected for this application."
      );
      setSelectionMessage("");
      return;
    }

    setSelectingOfferId(offer.id);
    setSelectionMessage("");
    setSelectionError("");

    try {
      const response = await fetch(
        `${API_BASE}/offers/${offer.id}/select?user_id=${userId}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to select this offer.");
      }

      setOffers((currentOffers) =>
        currentOffers.map((item) =>
          item.id === data.id ? { ...item, ...data } : item
        )
      );

      setSelectionMessage(
        "Offer selected successfully. This records your selection in EasyLoan; it does not mean the lender has approved or disbursed the loan."
      );
    } catch (err) {
      setSelectionError(err.message || "Could not connect to the backend.");
    } finally {
      setSelectingOfferId(null);
    }
  }

  async function handleRejectOffer(offer) {
    if (!userId || !applicationId) {
      setSelectionError(
        "Your user or application details are missing. Please log in again."
      );
      setSelectionMessage("");
      return;
    }

    if (offer.status !== "PENDING") {
      setSelectionError("Only pending offers can be rejected.");
      setSelectionMessage("");
      return;
    }

    setRejectingOfferId(offer.id);
    setSelectionMessage("");
    setSelectionError("");

    try {
      const response = await fetch(
        `${API_BASE}/offers/${offer.id}/reject?user_id=${userId}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to reject this offer.");
      }

      setOffers((currentOffers) =>
        currentOffers.map((item) =>
          item.id === data.id ? { ...item, ...data } : item
        )
      );

      setSelectionMessage("Offer rejected successfully.");
    } catch (err) {
      setSelectionError(err.message || "Could not connect to the backend.");
    } finally {
      setRejectingOfferId(null);
    }
  }

  const hasAcceptedOffer = offers.some(
    (offer) =>
      offer.application_id === applicationId &&
      offer.status === "ACCEPTED"
  );

  const isProcessing =
    selectingOfferId !== null || rejectingOfferId !== null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            Your Loan Offers
          </h1>

          <p className="mb-6 text-gray-600">
            Compare the simulated offers returned by the EasyLoan backend.
          </p>

          {requestedAmount > 0 && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-blue-900">
              <p className="text-sm">Your requested loan amount</p>
              <p className="text-2xl font-bold">
                ₹{formatMoney(requestedAmount)}
              </p>
            </div>
          )}

          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Demo only:</strong> These are simulated offers from
            fictional lenders, not real bank approvals or available loan offers.
          </div>

          {loading && (
            <p className="py-8 text-gray-600">
              Loading offers from EasyLoan...
            </p>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {selectionMessage && (
                <div
                  role="status"
                  className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
                >
                  {selectionMessage}
                </div>
              )}

              {selectionError && (
                <div
                  role="alert"
                  className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
                >
                  {selectionError}
                </div>
              )}

              {offers.length === 0 ? (
                <p className="rounded-lg border bg-white p-6 text-gray-600">
                  No offers are available for this application yet.
                </p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {offers.map((offer) => {
                    const isAccepted = offer.status === "ACCEPTED";
                    const isPending = offer.status === "PENDING";
                    const isRejected = offer.status === "REJECTED";

                    const anotherOfferSelected =
                      hasAcceptedOffer && !isAccepted;

                    return (
                      <article
                        key={offer.id}
                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                      >
                        <p className="mb-2 text-sm text-gray-500">
                          Demo lender
                        </p>

                        <h2 className="font-semibold text-gray-900">
                          {offer.lender_name ||
                            `Demo Lender ${offer.lender_id}`}
                        </h2>

                        <p className="text-sm text-gray-500">
                          Interest rate
                        </p>

                        <p className="mb-4 text-3xl font-bold text-blue-700">
                          {Number(
                            offer.interest_rate_percentage
                          ).toFixed(2)}%
                          <span className="text-sm font-normal"> p.a.</span>
                        </p>

                        <div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
                          <div className="flex justify-between gap-3">
                            <span className="text-gray-500">
                              Offered amount
                            </span>
                            <span className="font-medium">
                              ₹{formatMoney(offer.offered_amount)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span className="text-gray-500">Tenure</span>
                            <span className="font-medium">
                              {offer.tenure_months} months
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span className="text-gray-500">
                              Processing fee
                            </span>
                            <span className="font-medium">
                              ₹{formatMoney(offer.processing_fees)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3">
                            <span className="text-gray-500">Offer status</span>
                            <span
                              className={`font-semibold ${
                                isAccepted
                                  ? "text-green-700"
                                  : isPending
                                  ? "text-amber-700"
                                  : isRejected
                                  ? "text-red-700"
                                  : "text-gray-600"
                              }`}
                            >
                              {offer.status}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectOffer(offer)}
                          disabled={
                            isProcessing ||
                            !isPending ||
                            hasAcceptedOffer
                          }
                          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                          {selectingOfferId === offer.id
                            ? "Selecting..."
                            : isAccepted
                            ? "Offer selected"
                            : anotherOfferSelected
                            ? "Another offer selected"
                            : isPending
                            ? "Select offer"
                            : "Unavailable"}
                        </button>

                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleRejectOffer(offer)}
                            disabled={isProcessing}
                            className="mt-3 w-full rounded-lg border border-red-300 px-4 py-3 font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {rejectingOfferId === offer.id
                              ? "Rejecting..."
                              : "Reject offer"}
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

     ```
  <Footer />
</>

);
}

export default Offers;
