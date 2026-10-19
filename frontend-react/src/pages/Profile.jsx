
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  // Demo data until persistent profile storage is available.
  const [profile, setProfile] = useState({
    fullName: 'Your Name',
    email: 'your.email@example.com',
    phone: '',
  })

  const [draft, setDraft] = useState(profile)

  function handleChange(event) {
    setDraft((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }))
    setSaved(false)
  }

  function handleSave(event) {
    event.preventDefault()
    setProfile(draft)
    setIsEditing(false)
    setSaved(true)
  }

  function handleCancel() {
    setDraft(profile)
    setIsEditing(false)
    setSaved(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            My Account
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            My Profile
          </h1>
          <p className="mt-2 text-gray-500">
            Manage your account information and access your loan journey.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <aside className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700">
                {profile.fullName.trim().charAt(0).toUpperCase() || 'U'}
              </div>

              <h2 className="mt-4 break-words text-xl font-bold">
                {profile.fullName || 'Your Name'}
              </h2>
              <p className="mt-1 break-all text-sm text-gray-500">
                {profile.email}
              </p>

              <span className="mt-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Demo account
              </span>
            </div>

            <nav className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
              <Link
                to="/my-applications"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <span aria-hidden="true">▤</span>
                My Applications
              </Link>

              <Link
                to="/offers"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <span aria-hidden="true">₹</span>
                Loan Offers
              </Link>

              <Link
                to="/eligibility"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                <span aria-hidden="true">✓</span>
                Check Eligibility
              </Link>
            </nav>
          </aside>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Personal Information</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your basic account details.
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setDraft(profile)
                    setIsEditing(true)
                    setSaved(false)
                  }}
                  className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {saved && (
              <p
                role="status"
                className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-800"
              >
                Changes updated in this page. They are not saved to the backend.
              </p>
            )}

            {isEditing ? (
              <form onSubmit={handleSave} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={draft.fullName}
                    onChange={handleChange}
                    required
                    minLength={2}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={draft.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone number (optional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={draft.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <dl className="mt-6 divide-y divide-gray-100">
                <div className="py-5">
                  <dt className="text-sm text-gray-500">Full name</dt>
                  <dd className="mt-1 break-words font-medium">
                    {profile.fullName || 'Not provided'}
                  </dd>
                </div>

                <div className="py-5">
                  <dt className="text-sm text-gray-500">Email address</dt>
                  <dd className="mt-1 break-all font-medium">
                    {profile.email || 'Not provided'}
                  </dd>
                </div>

                <div className="py-5">
                  <dt className="text-sm text-gray-500">Phone number</dt>
                  <dd className="mt-1 font-medium">
                    {profile.phone || 'Not provided'}
                  </dd>
                </div>
              </dl>
            )}

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-800">
                About your account
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                This profile currently uses demo information. Connecting
                your account details to the backend will require
                authenticated profile data.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Profile
