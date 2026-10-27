
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

function Apply() {
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    city: '',
    loanType: '',
    loanAmount: '',
    tenure: '',
    employment: '',
    monthlyIncome: '',
    existingEmis: '',
  })

  const navigate = useNavigate()

  function updateField(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setError('')
  }

  async function submitForm(event) {
    event.preventDefault()
    setError('')

    if (
      !formData.fullName.trim() ||
      !/^\d{10}$/.test(formData.mobile) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) ||
      !formData.city.trim()
    ) {
      setError(
        'Please enter your name, valid 10-digit mobile number, email and city or pincode.'
      )
      return
    }

    if (
      !formData.loanType ||
      !Number.isFinite(Number(formData.loanAmount)) ||
      Number(formData.loanAmount) <= 0 ||
      !formData.tenure
    ) {
      setError('Please complete all loan requirement fields correctly.')
      return
    }

    if (
      !formData.employment ||
      formData.monthlyIncome === '' ||
      !Number.isFinite(Number(formData.monthlyIncome)) ||
      Number(formData.monthlyIncome) < 0 ||
      formData.existingEmis === '' ||
      !Number.isFinite(Number(formData.existingEmis)) ||
      Number(formData.existingEmis) < 0
    ) {
      setError('Please complete all employment and income fields correctly.')
      return
    }

    if (!consent) {
      setError(
        'Please read and accept the consent notice before continuing.'
      )
      return
    }

    let user

    try {
      user = JSON.parse(localStorage.getItem('easyloan_user') || 'null')
    } catch {
      user = null
    }

    if (!user?.id) {
      setError('Please log in before submitting your application.')
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Save the application in the backend.
      const response = await fetch(
        `${API_URL}/applications?user_id=${encodeURIComponent(user.id)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            requested_amount: Number(formData.loanAmount),
            monthly_income: Number(formData.monthlyIncome),
            monthly_obligations: Number(formData.existingEmis),
            purpose: formData.loanType,
          }),
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const detail = data?.detail

        const message = Array.isArray(detail)
          ? detail.map((item) => item.msg).join(', ')
          : typeof detail === 'string'
            ? detail
            : `Application could not be saved (HTTP ${response.status}).`

        throw new Error(message)
      }

      if (!data?.id) {
        throw new Error(
          'The application was saved, but the backend did not return its ID.'
        )
      }

      // Step 2: Record consent separately for each demo lender.
      // If this step fails, do not navigate to the Offers page.
      for (const lenderId of [1, 2]) {
        const consentResponse = await fetch(
          `${API_URL}/applications/route-with-consent?user_id=${encodeURIComponent(user.id)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              application_id: data.id,
              lender_id: lenderId,
            }),
          }
        )

        const consentData = await consentResponse.json().catch(() => null)

        if (!consentResponse.ok) {
          const detail = consentData?.detail

          const message =
            typeof detail === 'string'
              ? detail
              : `Consent or routing failed for demo lender ${lenderId} (HTTP ${consentResponse.status}).`

          throw new Error(
            `Application ${data.id} was saved, but ${message} You can find the application under your account.`
          )
        }
      }

      // Step 3: Open Offers. Offers.jsx fetches offers from the backend.
      navigate('/offers', {
        state: {
          application: {
            ...formData,
            ...data,
            applicationId: data.id,
            loanAmount: formData.loanAmount,
            loanType: formData.loanType,
          },
        },
      })
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot reach the backend. Check that FastAPI is running.'
          : err.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            EasyLone
          </Link>

          <Link
            to="/"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            Loan application
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tell us what you need
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-gray-600">
            Enter your details below to explore illustrative loan options.
            Review your information before continuing.
          </p>
        </div>

        <form
          onSubmit={submitForm}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <section className="border-b border-gray-200 p-5 sm:p-8">
            <SectionHeading
              number="01"
              title="Personal information"
              description="Basic details to identify your application."
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Full name">
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={updateField}
                  className={inputClass}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </Field>

              <Field label="Mobile number">
                <input
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={updateField}
                  className={inputClass}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  required
                />
              </Field>

              <Field label="Email address">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={updateField}
                  className={inputClass}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </Field>

              <Field label="City / Pincode">
                <input
                  name="city"
                  value={formData.city}
                  onChange={updateField}
                  className={inputClass}
                  placeholder="Enter city or pincode"
                  autoComplete="address-level2"
                  required
                />
              </Field>
            </div>
          </section>

          <section className="border-b border-gray-200 p-5 sm:p-8">
            <SectionHeading
              number="02"
              title="Loan requirements"
              description="Specify the loan type, amount and preferred repayment period."
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Type of loan">
                <select
                  name="loanType"
                  value={formData.loanType}
                  onChange={updateField}
                  className={inputClass}
                  required
                >
                  <option value="">Select loan type</option>
                  <option>Personal Loan</option>
                  <option>Home Loan</option>
                  <option>Car Loan</option>
                  <option>Business Loan</option>
                  <option>Education Loan</option>
                  <option>Gold Loan</option>
                </select>
              </Field>

              <Field label="Loan amount (₹)">
                <input
                  name="loanAmount"
                  type="number"
                  min="1"
                  value={formData.loanAmount}
                  onChange={updateField}
                  className={inputClass}
                  placeholder="e.g. 500000"
                  required
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Preferred tenure">
                  <select
                    name="tenure"
                    value={formData.tenure}
                    onChange={updateField}
                    className={inputClass}
                    required
                  >
                    <option value="">Select repayment period</option>
                    <option>12 months</option>
                    <option>24 months</option>
                    <option>36 months</option>
                    <option>48 months</option>
                    <option>60 months</option>
                    <option>More than 5 years</option>
                  </select>
                </Field>
              </div>
            </div>
          </section>

          <section className="border-b border-gray-200 p-5 sm:p-8">
            <SectionHeading
              number="03"
              title="Employment & financial information"
              description="Provide your income and existing monthly EMI details."
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Employment type">
                <select
                  name="employment"
                  value={formData.employment}
                  onChange={updateField}
                  className={inputClass}
                  required
                >
                  <option value="">Select employment type</option>
                  <option>Salaried</option>
                  <option>Self-Employed</option>
                  <option>Business Owner</option>
                  <option>Student</option>
                  <option>Other</option>
                </select>
              </Field>

              <Field label="Monthly income / turnover (₹)">
                <input
                  name="monthlyIncome"
                  type="number"
                  min="0"
                  value={formData.monthlyIncome}
                  onChange={updateField}
                  className={inputClass}
                  placeholder="e.g. 45000"
                  required
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Existing monthly EMIs (₹)">
                  <input
                    name="existingEmis"
                    type="number"
                    min="0"
                    value={formData.existingEmis}
                    onChange={updateField}
                    className={inputClass}
                    placeholder="Enter 0 if you have no existing EMIs"
                    required
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 p-5 sm:p-8">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">
                  ⓘ
                </span>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Demonstration project
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    This application uses a development backend and fictional
                    lenders. Offers are simulated. No real lender is contacted,
                    no credit check is performed, and no loan approval is
                    provided. The current backend saves the requested amount,
                    monthly income, monthly obligations and loan purpose.
                    Other personal and employment fields are not yet saved
                    by this application API.
                  </p>
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 border-t border-blue-100 pt-4">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => {
                    setConsent(event.target.checked)
                    setError('')
                  }}
                  className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                />

                <span className="text-sm leading-6 text-gray-700">
                  I consent to recording my application-sharing consent for
                  EasyLoan Demo Lender A and EasyLoan Demo Lender B in the
                  development database for this demonstration. I understand
                  that the lenders are fictional and no real lender is
                  contacted.
                </span>
              </label>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/"
                className="inline-flex justify-center rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-white"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLoading ? 'Submitting application...' : 'Explore Loan Offers →'}
              </button>
            </div>
          </section>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-gray-500">
          Demo only. No real credit assessment or loan approval is provided.
        </p>
      </main>
    </div>
  )
}

function SectionHeading({ number, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
        {number}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  )
}

export default Apply
