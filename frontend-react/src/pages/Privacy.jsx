
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <header className="mb-10">
          <p className="mb-3 font-semibold text-blue-600">
            LEGAL & TRANSPARENCY
          </p>

          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            Privacy Policy
          </h1>

          <p className="text-gray-600">
            Learn how the current EasyLone demonstration handles information
            and what to consider before using a future live service.
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Last updated: October 2026
          </p>
        </header>

        <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="mb-2 font-bold text-blue-900">
            Important: This is a demo
          </h2>

          <p className="leading-7 text-blue-900">
            EasyLone is currently a demonstration project. Avoid entering
            real financial details, identity document numbers, passwords,
            or other sensitive personal information. This page describes
            the intended approach and is not a claim that production-grade
            privacy controls are already implemented.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-xl font-bold">
              1. Information You Provide
            </h2>

            <p className="leading-7 text-gray-600">
              The demo interface may ask for details such as your name,
              email address, city, employment information, income, existing
              EMIs, and loan requirements. These fields help demonstrate
              how a future loan application flow could work.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              2. How the Current Demo Works
            </h2>

            <p className="leading-7 text-gray-600">
              The current application uses frontend forms and illustrative
              sample offers. The contact form displays a confirmation
              without sending or saving a message. Authentication and
              application data are not connected to a production backend.
              However, information entered into a browser may still be
              processed by the browser or hosting environment, so do not
              enter sensitive real information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              3. Credit Checks and Lender Sharing
            </h2>

            <p className="leading-7 text-gray-600">
              The current demo does not perform a CIBIL inquiry, make a
              credit decision, submit a real loan application, or send
              your details to lenders. Any future credit checks or sharing
              with lenders must be implemented with appropriate notice,
              consent, security measures, and applicable legal requirements.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              4. Data Storage and Security
            </h2>

            <p className="leading-7 text-gray-600">
              A complete production data-storage and security system has
              not yet been established for this demo. Before launch, the
              service will need appropriate access controls, secure
              transmission, retention limits, protection against
              unauthorized access, and procedures for handling security
              incidents.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              5. Third-Party Services
            </h2>

            <p className="leading-7 text-gray-600">
              The demo does not currently provide live lender integrations.
              Any third-party services introduced in a future version
              should be identified, along with the information shared
              and the purposes for which it is used.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              6. Your Choices and Requests
            </h2>

            <p className="leading-7 text-gray-600">
              Avoid submitting sensitive information through this demo.
              Before a live service launches, clear processes should be
              established for privacy questions, access or correction
              requests, deletion requests where applicable, and withdrawal
              of consent where available under applicable law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              7. Children's Privacy
            </h2>

            <p className="leading-7 text-gray-600">
              EasyLone is designed as a loan-information demonstration,
              not as a service for children. Do not submit children's
              personal or financial information through the demo.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              8. Changes to This Policy
            </h2>

            <p className="leading-7 text-gray-600">
              This policy may need to change as EasyLone develops. Before
              handling real customer information, the policy must be
              reviewed and updated to accurately reflect the actual
              technology, data practices, and applicable legal requirements.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold">
              9. Contact
            </h2>

            <p className="leading-7 text-gray-600">
              For questions about this demonstration, visit the Contact
              page. A verified support contact and privacy-request process
              should be provided before the live service launches.
            </p>

            <a
              href="/contact"
              className="mt-3 inline-block font-semibold text-blue-600 hover:text-blue-700"
            >
              Visit Contact Us →
            </a>
          </section>
        </div>

        <p className="mt-10 border-t border-gray-200 pt-6 text-sm leading-6 text-gray-500">
          This draft is for the development demo and is not legal advice.
          Review it against the actual implementation and applicable
          requirements before launching a live financial service.
        </p>
      </main>

      <Footer />
    </div>
  )
}

export default Privacy
