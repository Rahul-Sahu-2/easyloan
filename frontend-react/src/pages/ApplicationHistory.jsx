
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const API_URL = 'http://127.0.0.1:8000/api/v1'

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
    CANCELLED: {
      label: 'Cancelled',
      description:
        'This application has been cancelled. Its records and history are retained.',
      color: 'bg-red-100 text-red-800',
    },
    APPROVED: {
      label: 'Approved',
      description: 'This application has been approved.',
      color: 'bg-green-100 text-green-800',
    },
    REJECTED: {
      label: 'Rejected',
      description: 'This application has been rejected.',
      color: 'bg-red-100 text-red-800',
    },
  }

  return statuses[normalized] || {
    label: normalized.replaceAll('_', ' ') || 'Unknown',
    description: 'Current status returned by the backend.',
    color: 'bg-gray-100 text-gray-700',
  }
}

function ApplicationHistory() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [cancelSuccess, setCancelSuccess] = useState('')
  const [supportApplication, setSupportApplication] = useState(null)
  const [supportType, setSupportType] = useState('Accidental cancellation')
  const [supportMessage, setSupportMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchApplications() {
      setLoading(true)
      setError('')

      let user

      try {
        user = JSON.parse(localStorage.getItem('easyloan_user') || 'null')
      } catch {
        user = null
      }

      if (!user?.id) {
        setError('Please log in to view your application history.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${API_URL}/applications/me?user_id=${encodeURIComponent(user.id)}`,
          {
            headers: { Accept: 'application/json' },
          }
        )

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          const detail = data?.detail
          throw new Error(
            typeof detail === 'string'
              ? detail
              : `Could not load applications (HTTP ${response.status}).`
          )
        }

        if (!Array.isArray(data)) {
          throw new Error('The backend returned an unexpected response.')
        }

        if (!cancelled) {
          setApplications(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message === 'Failed to fetch'
              ? 'Cannot reach the backend. Check that FastAPI is running.'
              : err.message || 'Could not load your application history.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchApplications()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleCancelApplication() {
    if (!cancelTarget || cancelling) return

    let user

    try {
      user = JSON.parse(localStorage.getItem('easyloan_user') || 'null')
    } catch {
      user = null
    }

    if (!user?.id) {
      setCancelError('Please log in again before cancelling an application.')
      return
    }

    setCancelling(true)
    setCancelError('')
    setCancelSuccess('')

    try {
      const response = await fetch(
        `${API_URL}/applications/${encodeURIComponent(
          cancelTarget.id
        )}/cancel?user_id=${encodeURIComponent(user.id)}`,
        {
          method: 'PATCH',
          headers: { Accept: 'application/json' },
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const detail = data?.detail
        throw new Error(
          typeof detail === 'string'
            ? detail
            : `Cancellation failed (HTTP ${response.status}).`
        )
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === cancelTarget.id
            ? { ...application, status: 'CANCELLED' }
            : application
        )
      )

      setCancelSuccess(
        `Application #${cancelTarget.id} has been cancelled. Its existing records have not been deleted.`
      )
      setCancelTarget(null)
    } catch (err) {
      setCancelError(
        err.message === 'Failed to fetch'
          ? 'Cannot reach the backend. Check that FastAPI is running.'
          : err.message || 'Could not cancel the application.'
      )
    } finally {
      setCancelling(false)
    }
  }

  function openSupport(application) {
    setSupportApplication(application)
    setSupportType('Accidental cancellation')
    setSupportMessage('')
  }

  function closeSupport() {
    setSupportApplication(null)
    setSupportMessage('')
  }

  const cancelledCount = applications.filter(
    (item) => item.status?.toUpperCase() === 'CANCELLED'
  ).length

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                Your account
              </p>

              <h1 className="text-3xl font-bold text-gray-900">
                Application History
              </h1>

              <p className="mt-2 text-gray-600">
                View your submitted applications and their latest backend status.
              </p>
            </div>

            <Link
              to="/apply"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              + New application
            </Link>
          </div>

          {cancelSuccess && (
            <div
              role="status"
              className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
            >
              {cancelSuccess}
            </div>
          )}

          {cancelError && !cancelTarget && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
            >
              {cancelError}
            </div>
          )}

          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <SummaryCard
              label="Total applications"
              value={applications.length}
            />

            <SummaryCard
              label="Under review"
              value={
                applications.filter(
                  (item) => item.status?.toUpperCase() === 'UNDER_REVIEW'
                ).length
              }
            />

            <SummaryCard
              label="Offers available"
              value={
                applications.filter(
                  (item) => item.status?.toUpperCase() === 'OFFER_AVAILABLE'
                ).length
              }
            />

            <SummaryCard label="Cancelled" value={cancelledCount} />
          </div>

          {loading && (
            <div className="rounded-xl border bg-white p-8 text-gray-600">
              Loading your applications...
            </div>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
            >
              {error}
            </div>
          )}

          {!loading && !error && applications.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                No applications yet
              </h2>

              <p className="mt-2 text-gray-600">
                Your submitted loan applications will appear here.
              </p>

              <Link
                to="/apply"
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Start an application
              </Link>
            </div>
          )}

          {!loading && !error && applications.length > 0 && (
            <div className="space-y-5">
              {applications.map((application) => {
                const status = getStatusDetails(application.status)
                const normalizedStatus = String(
                  application.status || ''
                ).toUpperCase()

                const canCancel = [
                  'DRAFT',
                  'SUBMITTED',
                  'UNDER_REVIEW',
                  'OFFER_AVAILABLE',
                ].includes(normalizedStatus)

                const canViewOffers = [
                  'OFFER_AVAILABLE',
                  'CANCELLED',
                ].includes(normalizedStatus)

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
                          Submitted:{' '}
                          {new Date(application.created_at).toLocaleString(
                            'en-IN'
                          )}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-3">
                        {canViewOffers && (
                          <Link
                            to="/offers"
                            state={{ application }}
                            className="inline-flex rounded-lg border border-blue-600 px-4 py-2.5 font-medium text-blue-700 transition hover:bg-blue-50"
                          >
                            View offers
                          </Link>
                        )}

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelError('')
                              setCancelTarget(application)
                            }}
                            className="inline-flex rounded-lg border border-red-300 px-4 py-2.5 font-medium text-red-700 transition hover:bg-red-50"
                          >
                            Cancel application
                          </button>
                        )}

                        {normalizedStatus === 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => openSupport(application)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            <span aria-hidden="true">✉</span>
                            Contact Support
                          </button>
                        )}
                      </div>

                      {normalizedStatus === 'CANCELLED' && (
                        <p className="mt-3 text-sm text-gray-500">
                          Need help with this cancellation? Contact Support
                          and include your application ID.
                        </p>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          <p className="mt-6 text-sm leading-6 text-gray-500">
            Statuses come from the EasyLoan backend. Loan offers in this
            demonstration are simulated and do not represent real approvals.
          </p>
        </div>
      </main>

      <Footer />

      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !cancelling) {
              setCancelTarget(null)
              setCancelError('')
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
              <span className="text-2xl" aria-hidden="true">!</span>
            </div>

            <h2
              id="cancel-dialog-title"
              className="text-xl font-bold text-gray-900"
            >
              Cancel application #{cancelTarget.id}?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Are you sure you want to cancel this loan application? Its
              application details and existing history will be retained, but
              offer selection should no longer be allowed.
            </p>

            <p className="mt-2 text-sm font-medium text-gray-700">
              If you cancel by mistake, use Contact Support to request help.
            </p>

            {cancelError && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {cancelError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => {
                  setCancelTarget(null)
                  setCancelError('')
                }}
                className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Keep application
              </button>

              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelApplication}
                className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Yes, cancel application'}
              </button>
            </div>
          </section>
        </div>
      )}

      {supportApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-dialog-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id="support-dialog-title"
              className="text-xl font-bold text-gray-900"
            >
              Contact Support
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Application #{supportApplication.id}
            </p>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              Tell us what happened. Your application ID will help identify
              the affected application.
            </p>

            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => event.preventDefault()}
            >
              <div>
                <label
                  htmlFor="support-type"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  What do you need help with?
                </label>

                <select
                  id="support-type"
                  value={supportType}
                  onChange={(event) => setSupportType(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option>Accidental cancellation</option>
                  <option>Application status</option>
                  <option>Loan offers</option>
                  <option>Consent history</option>
                  <option>Other issue</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="support-message"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Describe your issue
                </label>

                <textarea
                  id="support-message"
                  value={supportMessage}
                  onChange={(event) => setSupportMessage(event.target.value)}
                  rows={4}
                  maxLength={2000}
                  required
                  placeholder="Explain what happened and what help you need..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-right text-xs text-gray-500">
                  {supportMessage.length}/2000
                </p>
              </div>

              <p className="rounded-lg bg-amber-50 p-3 text-sm leading-5 text-amber-800">
                The support form is a frontend preview. Your message will not
                be sent or saved until we connect the support backend.
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeSupport}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={!supportMessage.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prepare support request
                </button>
              </div>
            </form>

            <p className="mt-3 text-xs text-gray-500">
              Issue: {supportType}
            </p>
          </section>
        </div>
      )}
    </>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default ApplicationHistory
