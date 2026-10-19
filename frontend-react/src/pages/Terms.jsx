
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <header className="mb-10">
          <p className="mb-3 font-semibold text-blue-600">
            LEGAL & TRANSPARENCY
          </p>

          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            Terms & Conditions
          </h1>

          <p className="text-gray-600">
            Please read these terms before using the EasyLone demonstration.
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Last updated: October 2026
          </p>
        </header>

        <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="mb-2 font-bold text-blue-900">
            Demo notice
          </h2>

          <p className="leading-7 text-blue-900">
            EasyLone is currently a demonstration project. It is not a
            bank, lender, credit bureau, or loan approval service. These
            draft terms describe the current demo and must be reviewed
            before any public production launch.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-xl font-bold">
              1. Acceptance of Terms
            </h2>

            <p className="leading-7 text-gray-600">
              By accessing this demo, you agree to use it lawfully and
              understand that its features and information are provided
              for demonstration purposes. If you do not agree, please
              stop using the demo.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              2. Description of the Service
            </h2>

            <p className="leading-7 text-gray-600">
              The current demo allows users to explore the interface,
              enter sample loan requirements, view illustrative offers,
              and navigate a simulated application process. It does not
              submit real loan applications or connect to live lenders.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              3. Illustrative Loan Offers
            </h2>

            <p className="leading-7 text-gray-600">
              All sample lender names, interest rates, fees, amounts,
              tenures, and other offer details displayed in this demo are
              illustrative. They are not quotations, commitments, or
              offers from actual financial institutions. Do not rely on
              them when making financial decisions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              4. Eligibility and Loan Approval
            </h2>

            <p className="leading-7 text-gray-600">
              Any eligibility screen in the current demo only demonstrates
              basic input validation. It does not assess your creditworthiness,
              verify your income, check your CIBIL report, or predict or
              guarantee loan approval. Actual decisions depend on the
              relevant lender's processes and requirements.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              5. User Responsibilities
            </h2>

            <p className="leading-7 text-gray-600">
              You agree not to misuse the demo, attempt unauthorized access,
              interfere with its operation, or submit information that you
              are not authorized to provide. Avoid entering real financial
              details, identity document numbers, passwords, or other
              sensitive personal information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              6. Accounts and Applications
            </h2>

            <p className="leading-7 text-gray-600">
              Login, signup, profile, and application-history interfaces
              may be demonstration-only until connected to a secure backend.
              Do not assume that an account has been authenticated, an
              application has been saved, or a lender has received your
              information unless a future live service explicitly confirms it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              7. Future Features
            </h2>

            <p className="leading-7 text-gray-600">
              Planned features may include lender integrations, live offers,
              credit checks, and application submission. These features are
              not available merely because they are described in the interface
              or product vision. Any future release will require appropriate
              implementation, permissions, disclosures, and applicable
              compliance measures.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              8. Availability and Changes
            </h2>

            <p className="leading-7 text-gray-600">
              Features, layouts, and sample data may change during development.
              The demo may be interrupted, modified, or discontinued without
              the reliability guarantees expected of a production service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              9. No Financial Advice
            </h2>

            <p className="leading-7 text-gray-600">
              The demo is not financial, legal, or tax advice. Before making
              a borrowing decision, review verified terms from the relevant
              lender and consider seeking advice suited to your circumstances.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              10. Disclaimer and Liability
            </h2>

            <p className="leading-7 text-gray-600">
              The demo is provided for development and evaluation purposes.
              To the extent permitted by applicable law, no guarantee is made
              that sample data is accurate, complete, or suitable for a
              particular decision. Any production disclaimer and limitation
              of liability must be reviewed for legal enforceability.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              11. Applicable Law
            </h2>

            <p className="leading-7 text-gray-600">
              The governing law and dispute-resolution provisions for a
              production version must be established with qualified legal
              advice and must comply with applicable requirements.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              12. Contact
            </h2>

            <p className="leading-7 text-gray-600">
              For questions about the demo, visit the Contact page.
              A verified support channel should be provided before launch.
            </p>

            <a
              href="/contact"
              className="mt-3 inline-block font-semibold text-blue-600 hover:text-blue-700"
            >
              Contact Us →
            </a>
          </section>
        </div>

        <p className="mt-10 border-t border-gray-200 pt-6 text-sm leading-6 text-gray-500">
          This is a development draft, not legal advice. Have the terms
          reviewed against the actual service and applicable law before
          launching EasyLone as a live financial platform.
        </p>
      </main>

      <Footer />
    </div>
  )
}

export default Terms
