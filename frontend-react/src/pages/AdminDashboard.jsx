
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const stats = [
  { label: 'Total Applications', value: '248', note: 'Demo data', icon: '📋' },
  { label: 'Pending Review', value: '42', note: 'Demo data', icon: '⏳' },
  { label: 'Approved', value: '156', note: 'Demo data', icon: '✓' },
  { label: 'Rejected', value: '50', note: 'Demo data', icon: '✕' },
]

const initialApplications = [
  { id: 'EL-1001', name: 'Aarav Sharma', type: 'Personal Loan', amount: 150000, date: '18 Oct 2026', status: 'Pending' },
  { id: 'EL-1002', name: 'Ananya Verma', type: 'Education Loan', amount: 300000, date: '17 Oct 2026', status: 'Approved' },
  { id: 'EL-1003', name: 'Rohan Patel', type: 'Home Loan', amount: 1200000, date: '16 Oct 2026', status: 'Pending' },
  { id: 'EL-1004', name: 'Isha Gupta', type: 'Personal Loan', amount: 80000, date: '15 Oct 2026', status: 'Rejected' },
  { id: 'EL-1005', name: 'Kabir Singh', type: 'Business Loan', amount: 250000, date: '14 Oct 2026', status: 'Approved' },
]

function formatAmount(amount) {
  return '₹' + amount.toLocaleString('en-IN')
}

function AdminDashboard() {
  const [applications, setApplications] = useState(initialApplications)
  const [filter, setFilter] = useState('All')

  const filteredApplications =
    filter === 'All'
      ? applications
      : applications.filter((app) => app.status === filter)

  function updateStatus(id, status) {
    setApplications((current) =>
      current.map((app) => (app.id === id ? { ...app, status } : app))
    )
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-sm font-medium text-teal-700">
                EASYLONE / ADMIN
              </p>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-slate-600">
                Overview of sample loan applications and their statuses.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ← Back to website
            </Link>
          </div>

          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Demo dashboard:</strong> All figures and applicants below
            are fictional. Changes are temporary and will reset when the page
            reloads. This page is not protected by admin authentication yet.
          </div>

          <section
            aria-label="Application statistics"
            className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">
                    {stat.label}
                  </p>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-lg text-teal-700">
                    {stat.icon}
                  </span>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs text-slate-500">{stat.note}</p>
              </div>
            ))}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recent Applications
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review and update fictional sample records.
                </p>
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-600">
                Filter:
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Application ID</th>
                    <th className="px-5 py-4 font-semibold">Applicant</th>
                    <th className="px-5 py-4 font-semibold">Loan Type</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-teal-700">
                        {app.id}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                        {app.name}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {app.type}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                        {formatAmount(app.amount)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {app.date}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          aria-label={`Change status for ${app.id}`}
                          value={app.status}
                          onChange={(event) =>
                            updateStatus(app.id, event.target.value)
                          }
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-teal-600 focus:outline-none"
                        >
                          <option>Pending</option>
                          <option>Approved</option>
                          <option>Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}

                  {filteredApplications.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No applications match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
              Showing {filteredApplications.length} sample applications
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default AdminDashboard
