
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'
const initialForm = {
  loanType: '',
  loanAmount: '',
  employment: '',
  monthlyIncome: '',
  existingEmis: '',
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500'

function getLoggedInUser() {
  try {
    const user = JSON.parse(localStorage.getItem('easyloan_user') || 'null')
    return user?.id || user?.user_id ? user : null
  } catch {
    return null
  }
}

function Eligibility() {
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [result, setResult] = useState(false)
  const [checkingApplications, setCheckingApplications] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({ ...current, [name]: value }))
    setError('')
    setResult(false)
  }

  async function handleContinueToApplication() {
    const user = getLoggedInUser()

    // Login is required to access the application flow.
    if (!user) {
      navigate('/login')
      return
    }

    setCheckingApplications(true)
    setError('')

    try {
      const userId = user.id ?? user.user_id

      const response = await fetch(
        `${API_URL}/applications/me?user_id=${encodeURIComponent(userId)}`
      )

      if (!response.ok) {
        throw new Error('Unable to check your existing applications. Please try again.')
      }

      const data = await response.json()

      const applications = Array.isArray(data)
        ? data
        : data.applications || []

      const activeApplications = applications.filter((application) => {
        const status = String(application.status || '').toUpperCase()

        return !['CANCELLED', 'REJECTED', 'APPROVED'].includes(status)
      })

      if (activeApplications.length === 0) {
        navigate('/apply')
        return
      }

      const startNew = window.confirm(
        `You have ${activeApplications.length} active application(s).\n\n` +
          'Click OK to view your existing applications.\n' +
          'Click Cancel to start a new application.'
      )

      if (startNew) {
        navigate('/my-applications')
      } else {
        navigate('/apply')
      }
    } catch (err) {
      setError(
        err.message || 'Something went wrong while checking your applications.'
      )
    } finally {
      setCheckingApplications(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (
      !form.loanType ||
      !form.employment ||
      form.loanAmount === '' ||
      form.monthlyIncome === '' ||
      form.existingEmis === ''
    ) {
      setError('Please complete all fields before continuing.')
      return
    }

    const amount = Number(form.loanAmount)
    const income = Number(form.monthlyIncome)
    const emis = Number(form.existingEmis)

    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(income) ||
      !Number.isFinite(emis) ||
      amount <= 0 ||
      income <= 0 ||
      emis < 0
    ) {
      setError('Enter a valid loan amount, income, and EMI amount.')
      return
    }

    setError('')
    setResult(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <p className="mb-2 text-sm font-semibold text-blue-600">
            EASYLOAN ELIGIBILITY DEMO
          </p>

          <h1 className="mb-3 text-3xl font-bold">
            Check Your Loan Eligibility
          </h1>

          <p className="text-gray-600">
            Share a few details to try our eligibility demo.
            No credit check is performed.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="loanType"
                className="mb-1 block text-sm font-medium"
              >
                What type of loan do you need?
              </label>

              <select
                id="loanType"
                name="loanType"
                value={form.loanType}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select loan type</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Car Loan">Car Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Education Loan">Education Loan</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="loanAmount"
                className="mb-1 block text-sm font-medium"
              >
                Loan Amount Needed (₹)
              </label>

              <input
                id="loanAmount"
                name="loanAmount"
                type="number"
                min="1"
                step="1"
                value={form.loanAmount}
                onChange={handleChange}
                placeholder="e.g. 500000"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="employment"
                className="mb-1 block text-sm font-medium"
              >
                Employment Type
              </label>

              <select
                id="employment"
                name="employment"
                value={form.employment}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select employment type</option>
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Business Owner">Business Owner</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="monthlyIncome"
                className="mb-1 block text-sm font-medium"
              >
                Monthly Income (₹)
              </label>

              <input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                min="1"
                step="1"
                value={form.monthlyIncome}
                onChange={handleChange}
                placeholder="e.g. 45000"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="existingEmis"
                className="mb-1 block text-sm font-medium"
              >
                Existing Monthly EMIs (₹)
              </label>

              <input
                id="existingEmis"
                name="existingEmis"
                type="number"
                min="0"
                step="1"
                value={form.existingEmis}
                onChange={handleChange}
                placeholder="Enter 0 if none"
                className={inputClass}
                required
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Check Eligibility
            </button>
          </form>

          {result && (
            <div
              role="status"
              className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5"
            >
              <h2 className="mb-2 text-lg font-semibold text-blue-900">
                Demo check completed
              </h2>

              <p className="mb-4 text-sm leading-6 text-blue-900">
                Your details passed basic input validation. This demo does
                not determine whether you qualify for a loan or guarantee
                that a lender will make an offer.
              </p>

              <p className="mb-4 text-sm text-blue-900">
                Loan type: {form.loanType}
              </p>

              <button
                type="button"
                onClick={handleContinueToApplication}
                disabled={checkingApplications}
                className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
              >
                {checkingApplications
                  ? 'Checking applications...'
                  : 'Continue to Application →'}
              </button>
            </div>
          )}

          <p className="mt-6 text-xs leading-5 text-gray-500">
            This is a demonstration only. No credit inquiry is performed,
            and this result is not a loan approval or an actual eligibility
            assessment.
          </p>

          <div className="mt-6 border-t border-gray-200 pt-4 text-center">
            <Link
              to="/my-applications"
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              View My Applications
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Eligibility
