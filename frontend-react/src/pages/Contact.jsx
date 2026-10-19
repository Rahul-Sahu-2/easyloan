
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setSubmitted(false)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-12 text-center">
          <p className="mb-3 font-semibold text-blue-600">
            HELP & SUPPORT
          </p>

          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            Contact Us
          </h1>

          <p className="mx-auto max-w-2xl text-gray-600">
            Have a question or feedback about EasyLone? Use the form
            below to prepare a demo message.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-5">
          <section className="space-y-6 md:col-span-2">
            <div className="rounded-2xl bg-blue-600 p-6 text-white">
              <h2 className="mb-3 text-xl font-bold">
                We're here to help
              </h2>

              <p className="leading-7 text-blue-100">
                EasyLone is currently a demonstration project. You can
                explore its pages and share feedback through the demo form.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-2 font-semibold">Frequently Asked Questions</h3>

              <p className="mb-3 text-sm leading-6 text-gray-600">
                You may find an answer to your question on our FAQ page.
              </p>

              <a
                href="/faq"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Visit FAQs →
              </a>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-2 font-semibold">Before you message us</h3>

              <p className="text-sm leading-6 text-gray-600">
                Please don't include passwords, bank account details,
                identity document numbers, or other sensitive financial
                information.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:col-span-3 md:p-8">
            <h2 className="mb-2 text-2xl font-bold">
              Send a Message
            </h2>

            <p className="mb-6 text-sm text-gray-500">
              All fields are required. This demo does not send or store your message.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Full Name
                </label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email Address
                </label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm font-medium"
                >
                  Subject
                </label>

                <select
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a subject</option>
                  <option value="General question">General question</option>
                  <option value="Eligibility">Eligibility</option>
                  <option value="Loan offers">Loan offers</option>
                  <option value="Technical issue">Technical issue</option>
                  <option value="Feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-medium"
                >
                  Message
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  maxLength={1000}
                  className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="How can we help?"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Preview Submission
              </button>

              {submitted && (
                <div
                  role="status"
                  className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800"
                >
                  <p className="mb-1 font-semibold">
                    Demo message prepared!
                  </p>

                  <p>
                    Your message has not been sent or saved. A backend
                    connection is needed to enable real contact submissions.
                  </p>
                </div>
              )}
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Contact

