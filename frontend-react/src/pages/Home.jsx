import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
        <Navbar />
        

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-center text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h1 className="mb-6 text-3xl font-bold leading-tight md:text-5xl">
            Explore Loan Options.
            <br />
            <span className="text-blue-200">
              Compare Them in One Place.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100 md:text-xl">
           Explore sample loan options, understand the application process,
           and compare illustrative loan details—all in one place.
          </p>

          <Link
            to="/apply"
            className="inline-block rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
          >
            Check My Loan Offers →
          </Link>

          <Link
            to="/eligibility"
            className="mt-3 inline-block rounded-xl border border-white px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10 sm:ml-3 sm:mt-0"
        >
            Check Eligibility
          </Link>

          <p className="mt-6 text-sm text-blue-200">
            Demo experience • No real credit check • No lender submission
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            How it Works
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              {
                title: "Fill One Simple Form",
                description:
                  "Answer a few basic questions about yourself and the loan you need.",
              },
              {
                title: "Soft Credit Check",
                description:
                  "We do a soft check that does not affect your CIBIL score.",
              },
              {
                title: "See Multiple Offers",
                description:
                  "Compare interest rates, EMI, and fees from different banks and NBFCs.",
              },
              {
                title: "Choose & Apply",
                description:
                  "Select the best offer. A hard credit check may happen with your chosen lender.",
              },
            ].map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan types */}
      <section id="loan-types" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">
            Loans We Help You With
          </h2>
          <p className="mb-12 text-center text-gray-600">
            Personal, Home, Business and more — all from one place
          </p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              ["👤", "Personal Loan"],
              ["🏠", "Home Loan"],
              ["🚗", "Car Loan"],
              ["💼", "Business Loan"],
              ["🎓", "Education Loan"],
              ["🥇", "Gold Loan"],
            ].map(([emoji, name]) => (
              <div
                key={name}
                className="rounded-xl bg-white p-5 text-center shadow-sm transition hover:shadow-md"
              >
                <div className="mb-2 text-3xl">{emoji}</div>
                <p className="font-medium">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Why People Prefer EasyLone
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "No Repeated Forms",
                description:
                  "Fill details only once. We share them with multiple lenders with your permission.",
              },
              {
                title: "Protects Your CIBIL",
                description:
                  "Soft check first. A hard inquiry may happen when you choose a final lender.",
              },
              {
                title: "Clear Comparison",
                description:
                  "Compare interest rates, EMI, processing fees and approval chances.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-gray-200 p-6"
              >
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section id="apply" className="bg-blue-600 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to see your loan offers?
          </h2>
          <p className="mb-8 text-blue-100">
            It only takes a few minutes. Soft check. No impact on your CIBIL
            score.
          </p>
          <Link
            to="/apply"
            className="inline-block rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Start Now – It’s Free
          </Link>
        </div>
      </section>
        <Footer />
    </div>
  );
}

export default Home;
