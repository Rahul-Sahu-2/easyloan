import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

function getLoggedInUser() {
  try {
    const user = JSON.parse(localStorage.getItem('easyloan_user') || 'null')
    return user?.id || user?.user_id ? user : null
  } catch {
    return null
  }
}

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(getLoggedInUser)
  const [menuOpen, setMenuOpen] = useState(false)
  const [checkingApplications, setCheckingApplications] = useState(false)

  useEffect(() => {
    function loadUser() {
      setUser(getLoggedInUser())
    }

    window.addEventListener('storage', loadUser)

    return () => {
      window.removeEventListener('storage', loadUser)
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('easyloan_user')
    setUser(null)
    setMenuOpen(false)
    navigate('/')
  }

  async function handleApplyNow() {
    setMenuOpen(false)

    const currentUser = getLoggedInUser()

    if (!currentUser) {
      navigate('/login')
      return
    }

    const userId = currentUser.id ?? currentUser.user_id

    setCheckingApplications(true)

    try {
      const response = await fetch(
        `${API_URL}/applications/me?user_id=${encodeURIComponent(userId)}`
      )

      if (!response.ok) {
        throw new Error('Could not check your existing applications.')
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

      const shouldContinue = window.confirm(
        `You already have ${activeApplications.length} active application(s).\n\n` +
          'Click OK to continue with your existing application(s).\n' +
          'Click Cancel to start a new application.'
      )

      if (!shouldContinue) {
        navigate('/apply')
        return
      }

      navigate('/my-applications')
    } catch (error) {
      window.alert(
        error.message ||
          'Unable to check your applications. Please try again.'
      )
    } finally {
      setCheckingApplications(false)
    }
  }

  function handleProtectedNavigation(path) {
    setMenuOpen(false)

    if (!getLoggedInUser()) {
      navigate('/login')
      return
    }

    navigate(path)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="text-2xl font-bold text-blue-700"
        >
          EasyLoan
        </Link>

        <button
          type="button"
          className="rounded-md p-2 text-gray-700 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </button>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-gray-700 hover:text-blue-700">
            Home
          </Link>

          <a
            href="/#how-it-works"
            className="text-gray-700 hover:text-blue-700"
          >
            How It Works
          </a>

          {user && (
            <button
              type="button"
              onClick={() => handleProtectedNavigation('/my-applications')}
              className="text-gray-700 hover:text-blue-700"
            >
              My Applications
            </button>
          )}

          <button
            type="button"
            onClick={handleApplyNow}
            disabled={checkingApplications}
            className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
          >
            {checkingApplications ? 'Checking...' : 'Apply Now'}
          </button>

          {user ? (
            <>
              <button
                type="button"
                onClick={() => handleProtectedNavigation('/profile')}
                className="text-gray-700 hover:text-blue-700"
              >
                Profile
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-700">
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-lg border border-blue-700 px-4 py-2 font-semibold text-blue-700 hover:bg-blue-50"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="space-y-3 border-t border-gray-200 px-4 py-4 md:hidden">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-gray-700"
          >
            Home
          </Link>

          <a
            href="/#how-it-works"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-gray-700"
          >
            How It Works
          </a>

          {user && (
            <button
              type="button"
              onClick={() => handleProtectedNavigation('/my-applications')}
              className="block w-full py-2 text-left text-gray-700"
            >
              My Applications
            </button>
          )}

         

          {user ? (
            <>
              <button
                type="button"
                onClick={() => handleProtectedNavigation('/profile')}
                className="block w-full py-2 text-left text-gray-700"
              >
                Profile
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="block w-full py-2 text-left text-red-600"
              >
                Logout
              </button>
               <button
            type="button"
            onClick={handleApplyNow}
            disabled={checkingApplications}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {checkingApplications ? 'Checking...' : 'Apply Now'}
          </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-gray-700"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-gray-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar