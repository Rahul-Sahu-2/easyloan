
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const faqs = [
  {
    question: 'What is EasyLone?',
    answer:
      'EasyLone is a loan comparison platform concept designed to help users explore loan options in one place. This version is a demonstration, not a live lending service.',
  },
  {
    question: 'How does EasyLone work?',
    answer:
      'You can enter your loan requirements, check the basic details you provide, and explore illustrative loan offers. Real lender integrations are planned for a future version.',
  },
  {
    question: 'Does checking eligibility affect my CIBIL score?',
    answer:
      'No actual credit check is performed by this demo. A real lender or credit check service may have different requirements, which should be explained before any live check takes place.',
  },
  {
    question: 'Are the loan offers real?',
    answer:
      'No. The offers currently displayed are illustrative examples for demonstration purposes. They are not live offers from banks or NBFCs.',
  },
  {
    question: 'Does submitting the form apply for a real loan?',
    answer:
      'No. The form currently demonstrates the application flow and does not submit an application to a lender.',
  },
  {
    question: 'Do I need to pay to use the demo?',
    answer:
      'The current demonstration does not charge you to explore its features. Any future service fees, if applicable, would need to be disclosed clearly.',
  },
  {
    question: 'How is my information used?',
    answer:
      'This version is a demo and does not yet have a complete production backend. Avoid entering real financial, identity, or other sensitive personal information.',
  },
  {
    question: 'When will live loan offers be available?',
    answer:
      'Live offers would require lender integrations, secure data handling, and the necessary agreements and compliance work. These capabilities are not available in the current demo.',
  },
]

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 font-semibold text-blue-600">
            HELP & SUPPORT
          </p>

          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            Frequently Asked Questions
          </h1>

          <p className="mx-auto max-w-2xl text-gray-600">
            Find answers about EasyLone, eligibility checks, sample offers,
            and what you can do with the current demo.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                aria-expanded={openIndex === index}
                className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold hover:bg-gray-50"
              >
                <span>{faq.question}</span>
                <span className="text-xl text-blue-600">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>

              {openIndex === index && (
                <div className="border-t border-gray-100 px-5 py-4 leading-7 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-blue-50 p-6 text-center">
          <h2 className="mb-2 text-xl font-bold">
            Still have questions?
          </h2>

          <p className="mb-5 text-gray-600">
            Visit our help page for more information.
          </p>

          <Link
            to="/contact"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Contact Us
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          EasyLone is currently a demonstration project. Sample offers are
          illustrative and are not loan approvals or live lender offers.
        </p>
      </main>

      <Footer />
    </div>
  )
}

export default FAQ
