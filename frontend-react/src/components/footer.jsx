
import { Link } from 'react-router-dom'

function Footer() {
  const linkClass =
    'text-sm text-gray-400 transition hover:text-white'

  return (
    <footer className="bg-gray-900 py-10 text-gray-400">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              to="/"
              className="text-2xl font-bold text-white"
            >
              EasyLone
            </Link>

            <p className="mt-3 text-sm leading-6">
              Explore loan options and learn about the application process.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-4 font-semibold text-white">
              Explore
            </h3>
            <div className="flex flex-col items-start gap-3">
              <Link to="/" className={linkClass}>
                Home
              </Link>
              <Link to="/#how-it-works" className={linkClass}>
                How It Works
              </Link>
              <Link to="/apply" className={linkClass}>
                Check Offers
              </Link>
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="mb-4 font-semibold text-white">
              Help & Support
            </h3>
            <div className="flex flex-col items-start gap-3">
              <Link to="/faq" className={linkClass}>
                FAQs
              </Link>
              <Link to="/contact" className={linkClass}>
                Contact Us
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-semibold text-white">
              Legal
            </h3>
            <div className="flex flex-col items-start gap-3">
              <Link to="/privacy" className={linkClass}>
                Privacy Policy
              </Link>
              <Link to="/terms" className={linkClass}>
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center">
          <p className="text-xs leading-5">
            EasyLone is currently a demonstration project. Offers and
            application data are illustrative and do not represent real
            financial offers. No real loan application or credit check is
            submitted through this demo.
          </p>

          <p className="mt-4 text-sm">
            © 2026 EasyLone. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
