
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28 lg:px-8">
            <div>
              <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
                A simpler way to explore loans
              </p>

              <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Explore Loan Options. Compare Them in One Place.
              </h1>

              <p className="mb-8 max-w-xl text-lg leading-8 text-blue-100">
                Explore sample loan options, understand the application
                process, and compare illustrative loan details—all in one
                place.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/apply"
                  className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-800 shadow transition hover:bg-blue-50"
                >
                  Apply for a Loan →
                </Link>

                <Link
                  to="/eligibility"
                  className="rounded-lg border border-white/70 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Check Eligibility
                </Link>
              </div>

              <p className="mt-6 text-sm text-blue-200">
                Demo experience • No real credit check • No lender submission
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">
                    Illustrative loan example
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">
                    Personal Loan
                  </h2>
                </div>

                <div className="rounded-xl bg-white/15 p-3 text-2xl">
                  ₹
                </div>
              </div>

              <div className="rounded-xl bg-white p-5 text-gray-800">
                <p className="text-sm text-gray-500">Example loan amount</p>
                <p className="mt-1 text-3xl font-bold text-blue-800">
                  ₹1,00,000
                </p>

                <div className="my-5 grid grid-cols-2 gap-4 border-t border-gray-200 pt-5">
                  <div>
                    <p className="text-sm text-gray-500">
                      Example interest rate
                    </p>
                    <p className="mt-1 font-semibold">10.5% p.a.</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Example tenure</p>
                    <p className="mt-1 font-semibold">24 months</p>
                  </div>
                </div>

                <p className="text-xs leading-5 text-gray-500">
                  These figures are illustrative only and are not a real
                  lender offer or a guarantee of approval.
                </p>
              </div>

              <p className="mt-5 text-sm leading-6 text-blue-100">
                Understand the process before making a real loan decision.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 font-semibold text-blue-700">
                HOW IT WORKS
              </p>

              <h2 className="text-3xl font-bold sm:text-4xl">
                A Simple Loan Exploration Process
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Understand the steps involved in exploring loan options.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  number: '01',
                  title: 'Fill One Simple Form',
                  description:
                    'Provide basic information about yourself and the loan you want to explore.',
                },
                {
                  number: '02',
                  title: 'Review Your Eligibility',
                  description:
                    'Review an illustrative eligibility result based on the information you provide.',
                },
                {
                  number: '03',
                  title: 'Explore Loan Options',
                  description:
                    'Compare illustrative loan amounts, interest rates, tenures, and fees.',
                },
                {
                  number: '04',
                  title: 'Understand Your Choices',
                  description:
                    'Review the available options and understand the next steps in the process.',
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <p className="mb-5 text-3xl font-bold text-blue-700">
                    {step.number}
                  </p>

                  <h3 className="mb-3 text-xl font-semibold">
                    {step.title}
                  </h3>

                  <p className="leading-7 text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Loan Types */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 font-semibold text-blue-700">
                LOAN CATEGORIES
              </p>

              <h2 className="text-3xl font-bold sm:text-4xl">
                Explore Different Loan Types
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                Choose a category to begin exploring your requirements.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: '👤',
                  title: 'Personal Loan',
                  description:
                    'Explore financing for personal needs and planned expenses.',
                },
                {
                  icon: '🎓',
                  title: 'Education Loan',
                  description:
                    'Explore financing for education-related expenses.',
                },
                {
                  icon: '🏠',
                  title: 'Home Loan',
                  description:
                    'Explore financing options for buying or building a home.',
                },
                {
                  icon: '💼',
                  title: 'Business Loan',
                  description:
                    'Explore financing for business needs and growth.',
                },
              ].map((loan) => (
                <Link
                  key={loan.title}
                  to="/apply"
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-6 transition hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                >
                  <span className="mb-4 block text-4xl" aria-hidden="true">
                    {loan.icon}
                  </span>

                  <h3 className="mb-2 text-xl font-semibold">
                    {loan.title}
                  </h3>

                  <p className="leading-7 text-gray-600">
                    {loan.description}
                  </p>

                  <span className="mt-5 inline-block font-semibold text-blue-700">
                    Get started →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why EasyLoan */}
        <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 font-semibold text-blue-700">
                WHY EASYLOAN
              </p>

              <h2 className="text-3xl font-bold sm:text-4xl">
                Why People Prefer EasyLoan
              </h2>

              <p className="mt-4 leading-7 text-gray-600">
                A straightforward way to understand your loan options.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: '📝',
                  title: 'Simple Process',
                  description:
                    'Start with one application to provide the information needed for this demo experience.',
                },
                {
                  icon: '🔎',
                  title: 'Transparent Process',
                  description:
                    'Understand the application process before any real lender or credit-bureau integration is enabled.',
                },
                {
                  icon: '📊',
                  title: 'Clear Comparison',
                  description:
                    'Review illustrative loan details to understand how amounts, rates, fees, and tenures can differ.',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm"
                >
                  <span className="mb-4 block text-4xl" aria-hidden="true">
                    {feature.icon}
                  </span>

                  <h3 className="mb-3 text-xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="leading-7 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-blue-800 px-4 py-16 text-center text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to Explore Your Loan Options?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-blue-100">
              Get started with a simple application and explore illustrative
              loan options.
            </p>

            <Link
              to="/apply"
              className="mt-8 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              Apply for a Loan
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home
