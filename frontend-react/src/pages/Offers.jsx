import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import mockOffers from "../data/mockOffers";

function Offers() {
    const location = useLocation();
const application = location.state?.application;

const requestedAmount = Number(application?.loanAmount) || 0;
console.log("Application received:", application);
const matchingOffers = mockOffers.filter(
  (offer) => offer.loanType === (application?.loanType || "Personal Loan")
);
  return (
    <>      
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            Your Loan Offers
          </h1>

        <p className="mb-6 text-gray-600">
          Compare the sample offers below to understand how EasyLone works.
        </p>
        {requestedAmount > 0 && (
  <div className="mb-6 rounded-lg bg-blue-50 p-4 text-blue-900">
    <p className="text-sm">Your requested loan amount</p>
    <p className="text-2xl font-bold">
      ₹{requestedAmount.toLocaleString("en-IN")}
    </p>
  </div>
)}

        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Demo only:</strong> These offers use fictional lenders and
          illustrative rates. They are not real or available loan offers.
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {matchingOffers.map((offer) => (
            <article
              key={offer.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <p className="mb-2 text-sm text-gray-500">
                {offer.loanType}
              </p>

              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                {offer.lender}
              </h2>

              <p className="text-sm text-gray-500">Illustrative interest rate</p>
              <p className="mb-4 text-3xl font-bold text-blue-700">
                {offer.interestRate}% <span className="text-sm font-normal">p.a.</span>
              </p>

              <div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Maximum amount</span>
                  <span className="font-medium">
                    ₹{offer.maxAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                {requestedAmount > 0 && (
  <div className="flex justify-between gap-3">
    <span className="text-gray-500">Amount comparison</span>
    <span className="text-right font-medium">
      {offer.maxAmount >= requestedAmount
        ? "Within demo limit"
        : "Below requested amount"}
    </span>
  </div>
)}

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Maximum tenure</span>
                  <span className="font-medium">
                    {offer.tenureYears} years
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Processing fee</span>
                  <span className="text-right font-medium">
                    {offer.processingFee}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  alert("Demo only: offer selection is not connected to a lender yet.")
                }
                className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                Select offer
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
    <Footer />
    </>     
  );
}

export default Offers;
