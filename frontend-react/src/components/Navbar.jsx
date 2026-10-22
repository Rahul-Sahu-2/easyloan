
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const linkClass =
    'block py-2 text-sm font-medium text-gray-700 transition hover:text-blue-600'

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    function readUser() {
      try {
        const savedUser = JSON.parse(
          localStorage.getItem('easyloan_user') || 'null'
        )
        setUser(savedUser?.id ? savedUser : null)
      } catch {
        setUser(null)
      }
    }

    readUser()
    window.addEventListener('storage', readUser)

    return () => window.removeEventListener('storage', readUser)
  }, [])

  function handleLogout() {
    localStorage.removeItem('easyloan_user')
    setUser(null)
    closeMenu()
    navigate('/login', { replace: true })
  }

  function handleProtectedNavigation(path) {
    closeMenu()

    if (!user) {
      navigate('/login')
      return
    }

    navigate(path)
  }

  function AuthLinks({ mobile = false }) {
    const className = mobile ? linkClass : linkClass

    if (!user) {
      return (
        <>
          <Link to="/login" className={className} onClick={closeMenu}>
            Login
          </Link>
          <Link to="/signup" className={className} onClick={closeMenu}>
            Sign Up
          </Link>
        </>
      )
    }

    return (
      <>
        <span className="block py-2 text-sm font-semibold text-green-700">
          Logged in: {user.full_name || user.email || 'User'}
        </span>

        <button
          type="button"
          className={`${className} text-left`}
          onClick={() => handleProtectedNavigation('/profile')}
        >
          My Profile
        </button>

        <button
          type="button"
          className={`${className} text-left`}
          onClick={() => handleProtectedNavigation('/my-applications')}
        >
          My Applications
        </button>

        <button
          type="button"
          className={`${className} text-left text-red-600 hover:text-red-700`}
          onClick={handleLogout}
        >
          Logout
        </button>
      </>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600"
          onClick={closeMenu}
        >
          EasyLoan
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className={linkClass}>Home</Link>
          <Link to="/#how-it-works" className={linkClass}>How It Works</Link>

          <AuthLinks />

          <button
            type="button"
            onClick={() => handleProtectedNavigation('/apply')}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Check Offers
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          <Link to="/" className={linkClass} onClick={closeMenu}>
            Home
          </Link>

          <Link
            to="/#how-it-works"
            className={linkClass}
            onClick={closeMenu}
          >
            How It Works
          </Link>

          <AuthLinks mobile />

          <button
            type="button"
            className="mt-2 block w-full rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => handleProtectedNavigation('/apply')}
          >
            Check Offers
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
