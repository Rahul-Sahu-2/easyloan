
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

import { API_URL } from "../api";

function Auth() {
  const location = useLocation()
  const navigate = useNavigate()
  const isSignup = location.pathname === '/signup'

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    if (isSignup && formData.fullName.trim().length < 2) {
      setMessage('Please enter your full name.')
      setMessageType('error')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setMessage('Please enter a valid email address.')
      setMessageType('error')
      return
    }

    if (formData.password.length < 8) {
      setMessage('Password must contain at least 8 characters.')
      setMessageType('error')
      return
    }

    setIsLoading(true)

    try {
      const endpoint = isSignup ? 'register' : 'login'
      const payload = isSignup
        ? {
            full_name: formData.fullName.trim(),
            email: formData.email.trim(),
            password: formData.password,
          }
        : {
            email: formData.email.trim(),
            password: formData.password,
          }

      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const detail = data?.detail
        const errorMessage = Array.isArray(detail)
          ? detail.map((item) => item.msg).join(', ')
          : typeof detail === 'string'
            ? detail
            : 'Request failed. Please try again.'

        throw new Error(errorMessage)
      }

      if (isSignup) {
        setMessage('Account created successfully! You can now log in.')
        setMessageType('success')
        setFormData((previous) => ({ ...previous, password: '' }))
      } else {
        const user = data?.user

        if (!user?.id) {
          throw new Error(
            'Login succeeded, but the backend did not return a user ID.'
          )
        }

        localStorage.setItem('easyloan_user', JSON.stringify(user))
        navigate('/', { replace: true })
      }
    } catch (error) {
      setMessage(
        error.message === 'Failed to fetch'
          ? 'Cannot reach the backend. Make sure FastAPI is running.'
          : error.message || 'Something went wrong. Please try again.'
      )
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lg md:grid-cols-2">
          <section className="hidden bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-white md:flex md:flex-col md:justify-center">
            <Link to="/" className="mb-10 text-3xl font-bold">
              EasyLoan
            </Link>

            <h1 className="mb-4 text-3xl font-bold leading-tight">
              Your loan journey, made simpler.
            </h1>

            <p className="leading-7 text-blue-100">
              Explore the EasyLoan demo and experience a simpler loan
              application journey.
            </p>

            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-blue-50">
              {isSignup
                ? 'Create your account to get started.'
                : 'Log in to continue to EasyLoan.'}
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <Link
              to="/"
              className="mb-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 md:hidden"
            >
              ← Back to EasyLoan
            </Link>

            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Welcome to EasyLoan
            </p>

            <h2 className="text-3xl font-bold">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {isSignup
                ? 'Enter your details to create an account.'
                : 'Enter your credentials to log in.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {isSignup && (
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    minLength={2}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-20 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {message && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`rounded-lg p-3 text-sm ${
                    messageType === 'success'
                      ? 'bg-green-50 text-green-800'
                      : messageType === 'error'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-blue-50 text-blue-800'
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                disabled={isLoading}
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLoading
                  ? 'Please wait...'
                  : isSignup
                    ? 'Create Account'
                    : 'Login'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link
                to={isSignup ? '/login' : '/signup'}
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                {isSignup ? 'Login' : 'Sign up'}
              </Link>
            </p>

            {isSignup && messageType === 'success' && (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="mt-4 w-full rounded-lg border border-blue-600 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
              >
                Go to Login
              </button>
            )}

            <p className="mt-6 text-center text-xs leading-5 text-gray-400">
              Demo project. Authentication requests are sent to your development
              backend.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Auth
