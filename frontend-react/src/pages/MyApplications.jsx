
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { API_URL } from '../api'

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })
}

function getStatusDetails(status) {
  const normalized = String(status || '').toUpperCase()

  const statuses = {
    DRAFT: {
      label: 'Draft',
      description: 'This application has not been submitted yet.',
      color: 'bg-gray-100 text-gray-700',
    },
    SUBMITTED: {
      label: 'Submitted',
      description: 'Your application has been submitted.',
      color: 'bg-blue-100 text-blue-800',
    },
    UNDER_REVIEW: {
      label: 'Under review',
      description: 'Your application is being processed in the demo system.',
      color: 'bg-amber-100 text-amber-800',
    },
    OFFER_AVAILABLE: {
      label: 'Offers available',
      description: 'Simulated loan offers have been generated.',
      color: 'bg-green-100 text-green-800',
    },
    OFFER_SELECTED: {
      label: 'Offer selected',
      description: 'You have selected a simulated loan offer.',
      color: 'bg-green-100 text-green-800',
    },
    APPROVED: {
      label: 'Approved',
      description: 'The backend reports this application as approved.',
      color: 'bg-green-100 text-green-800',
    },
    REJECTED: {
      label: 'Rejected',
      description: 'The backend reports that this application was rejected.',
      color: 'bg-red-100 text-red-800',
    },
    CANCELLED: {
      label: 'Cancelled',
      description: 'This application has been cancelled.',
      color: 'bg-gray-100 text-gray-700',
    },
  }

  return statuses[normalized] || {
    label: normalized.replaceAll('_', ' ') || 'Unknown',
    description: 'Current status returned by the backend.',
    color: 'bg-gray-100 text-gray-700',
  }
}

function MyApplications() {
  const [applications, setApplications] = useState([])
  const [selectedOffers, setSelectedOffers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadApplications() {
      setLoading(true)
      setError('')

      let user

      try {
        user = JSON.parse(localStorage.getItem('easyloan_user') || 'null')
      } catch {
        user = null
      }

      const userId = user?.id ?? user?.user_id

      if (!userId) {
        setError('Please log in to view your application history.')
        setLoading(false)
        return
      }

      try {
        // Step 1: Fetch user applications
        const response = await fetch(
          `${API_URL}/applications/me?user_id=${encodeURIComponent(userId)}`,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        )

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          const detail = data?.detail

          throw new Error(
            typeof detail === 'string'
              ? detail
              : `Unable to load applications (HTTP ${response.status}).`
          )
        }

        if (!Array.isArray(data)) {
          throw new Error('The backend returned an unexpected response.')
        }

        if (cancelled) return

        setApplications(data)

        // Step 2: Fetch offers for applications that may have offers
        const applicationsWithOffers = data.filter((application) =>
          [
            'OFFER_AVAILABLE',
            'UNDER_REVIEW',
            'OFFER_SELECTED',
          ].includes(String(application.status || '').toUpperCase())
        )

        const results = await Promise.all(
          applicationsWithOffers.map(async (application) => {
            try {
              const offersResponse = await fetch(
                `${API_URL}/offers/application/${application.id}?user_id=${encodeURIComponent(userId)}`,
                {
                  headers: {
                    Accept: 'application/json',
                  },
                }
              )

              const offersData = await offersResponse
                .json()
                .catch(() => null)

              if (!offersResponse.ok) {
                return [application.id, []]
              }

              return [
                application.id,
                Array.isArray(offersData) ? offersData : [],
              ]
            } catch {
              return [application.id, []]
            }
          })
        )

        if (!cancelled) {
          setSelectedOffers(Object.fromEntries(results))
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message === 'Failed to fetch'
              ? 'Cannot reach the backend. Make sure FastAPI is running.'
              : err.message || 'Unable to load application history.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadApplications()

    return () => {
      cancelled = true
    }
  }, [])

  // Count accepted offers
  const acceptedCount = Object.values(selectedOffers)
    .flat()
    .filter(
      (offer) => String(offer.status || '').toUpperCase() === 'ACCEPTED'
    ).length

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">

          {/* Page Heading */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                Your account
              </p>

              <h1 className="text-3xl font-bold text-gray-900">
                Application History
              </h1>

              <p className="mt-2 text-gray-600">
                Track your applications, offers, and selections.
              </p>
            </div>

            <Link
              to="/apply"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              + New application
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total applications"
              value={applications.length}
            />

            <SummaryCard
              label="Under review"
              value={applications.filter(
                (item) =>
                  String(item.status || '').toUpperCase() === 'UNDER_REVIEW'
              ).length}
            />

            <SummaryCard
              label="Offers selected"
              value={acceptedCount}
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-xl border bg-white p-8 text-gray-600">
              Loading your applications and offers...
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
            >
              {error}

              {error.startsWith('Cannot reach') && (
                <p className="mt-2 text-sm">
                  Start the backend and refresh this page.
                </p>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && applications.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                No applications yet
              </h2>

              <p className="mt-2 text-gray-600">
                Your submitted applications will appear here.
              </p>

              <Link
                to="/apply"
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Start an application
              </Link>
            </div>
          )}

          {/* Application List */}
          {!loading && !error && applications.length > 0 && (
            <div className="space-y-5">
              {applications.map((application) => {
                const status = getStatusDetails(application.status)

                const offers = selectedOffers[application.id] || []

                const acceptedOffer = offers.find(
                  (offer) =>
                    String(offer.status || '').toUpperCase() === 'ACCEPTED'
                )

                const hasOffers = offers.length > 0

                const canViewOffers = [
                  'OFFER_AVAILABLE',
                  'UNDER_REVIEW',
                  'OFFER_SELECTED',
                ].includes(
                  String(application.status || '').toUpperCase()
                )

                return (
                  <article
                    key={application.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Application #{application.id}
                        </p>

                        <h2 className="mt-1 text-xl font-semibold text-gray-900">
                          {application.purpose || 'Loan application'}
                        </h2>

                        <p className="mt-2 text-2xl font-bold text-gray-900">
                          ₹{formatMoney(application.requested_amount)}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Requested loan amount
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1.5 text-sm font-semibold ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <p className="text-sm leading-6 text-gray-600">
                        {status.description}
                      </p>

                      {application.created_at && (
                        <p className="mt-2 text-sm text-gray-500">
                          Created:{' '}
                          {new Date(application.created_at).toLocaleString(
                            'en-IN'
                          )}
                        </p>
                      )}

                      {/* Accepted Offer Details */}
                      {acceptedOffer && (
                        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                          <p className="font-semibold text-green-800">
                            Offer selected
                          </p>

                          <p className="mt-1 text-sm text-green-800">
                            {acceptedOffer.lender_name ||
                              `Demo Lender ${acceptedOffer.lender_id}`}
                          </p>

                          <p className="mt-1 text-sm text-green-800">
                            ₹{formatMoney(acceptedOffer.offered_amount)} at{' '}
                            {Number(
                              acceptedOffer.interest_rate_percentage
                            ).toFixed(2)}% p.a. for{' '}
                            {acceptedOffer.tenure_months} months
                          </p>

                          <p className="mt-2 text-xs text-green-800">
                            This records your selection in the demo system;
                            it is not lender approval.
                          </p>
                        </div>
                      )}

                      {/* Pending Offers */}
                      {hasOffers && !acceptedOffer && (
                        <p className="mt-3 text-sm text-gray-600">
                          {offers.length} simulated offer
                          {offers.length === 1 ? '' : 's'} available. No offer
                          has been selected yet.
                        </p>
                      )}

                      {/* View Offers Button */}
                      {canViewOffers && (
                        <Link
                          to="/offers"
                          state={{ applicationId: application.id }}
                          className="mt-4 inline-flex rounded-lg border border-blue-600 px-4 py-2.5 font-medium text-blue-700 transition hover:bg-blue-50"
                        >
                          {acceptedOffer
                            ? 'View selected offer'
                            : 'View offers'}
                        </Link>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <p className="mt-6 text-sm leading-6 text-gray-500">
            Application statuses and offers are retrieved from the backend.
            Offers in this demo are simulated and do not represent real loan
            approvals.
          </p>
        </div>
      </main>

      <Footer />
    </>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  )
}

export default MyApplications
