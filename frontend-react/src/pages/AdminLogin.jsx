
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter both your email and password.')
      return
    }

    setError(
      'Authentication is not connected yet. Please wait until the backend is ready.'
    )
  }

  return (
    <>
      <Navbar />

      <main className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4 py-12">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl">
              🔐
            </div>

            <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
              EasyLone Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Admin Sign In
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Sign-in will be enabled after backend authentication is connected.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Admin email
              </label>

              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-20 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 text-sm font-medium text-teal-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            This is a UI preview. No credentials are verified or stored.
          </p>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm font-medium text-teal-700 hover:underline"
            >
              ← Back to EasyLone
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default AdminLogin
