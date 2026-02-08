"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "How do I book an appointment?",
    answer:
      "You can book an appointment by filling out our online booking form. Simply select your preferred artist, provide details about your tattoo idea, upload any reference images, and submit your request. Our team will contact you within 24-48 hours to confirm your appointment.",
  },
  {
    question: "What are your pricing guidelines?",
    answer:
      "Pricing varies based on the size, complexity, placement, and style of your tattoo. We charge by the hour or by the piece, depending on the design. During your consultation, we'll provide a detailed quote. A deposit is typically required to secure your appointment.",
  },
  {
    question: "Do you require a deposit?",
    answer:
      "Yes, we require a deposit to secure your appointment. The deposit amount depends on the estimated cost of your tattoo and is applied toward the final price. Deposits are non-refundable but can be transferred to a rescheduled appointment with at least 48 hours notice.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "We require at least 48 hours notice to cancel or reschedule an appointment. Cancellations made with less than 48 hours notice may result in forfeiture of your deposit. We understand emergencies happen, so please contact us as soon as possible.",
  },
  {
    question: "How should I prepare for my appointment?",
    answer:
      "Get a good night's sleep, eat a meal before your appointment, stay hydrated, and avoid alcohol or blood-thinning medications 24 hours before. Wear comfortable clothing that allows easy access to the tattoo area. Bring a valid ID and any reference images or inspiration.",
  },
  {
    question: "What is your aftercare process?",
    answer:
      "We'll provide detailed aftercare instructions after your tattoo is complete. Generally, you'll need to keep the tattoo clean and moisturized, avoid soaking it in water for 2-3 weeks, avoid direct sunlight, and refrain from picking or scratching. We offer free touch-ups within 3 months if needed.",
  },
  {
    question: "Do you do cover-ups or touch-ups?",
    answer:
      "Yes! We specialize in cover-ups and can work with you to design a new tattoo that incorporates or completely covers an existing one. We also offer touch-ups for tattoos done at our studio within 3 months of the original appointment at no additional charge.",
  },
  {
    question: "What forms of payment do you accept?",
    answer:
      "We accept cash, credit cards, debit cards, and digital payment methods. For larger pieces, we may accept payment plans. Please discuss payment options with your artist during your consultation.",
  },
  {
    question: "How long does a tattoo take?",
    answer:
      "Tattoo duration varies greatly depending on size, complexity, and detail level. Small tattoos may take 30 minutes to an hour, while larger pieces can take multiple sessions of several hours each. Your artist will provide a time estimate during your consultation.",
  },
  {
    question: "Is there an age requirement?",
    answer:
      "Yes, you must be 18 years or older to get a tattoo. We require a valid government-issued ID at the time of your appointment. We do not tattoo minors, even with parental consent.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-[var(--muted)]">
          Everything you need to know about booking and getting a tattoo at Addictive Pain Tattoo
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[var(--surface)] transition-colors"
            >
              <span className="text-lg font-semibold text-[var(--foreground)] pr-4">
                {faq.question}
              </span>
              <svg
                className={`w-5 h-5 text-[var(--muted)] shrink-0 transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4">
                <p className="text-[var(--foreground)] leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-[var(--muted)] mb-4">Still have questions?</p>
        <a
          href="/contact"
          className="inline-block px-6 py-3 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}
