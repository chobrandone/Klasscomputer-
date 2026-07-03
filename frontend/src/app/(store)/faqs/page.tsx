import Link from 'next/link';

export const metadata = { title: 'FAQs' };

const faqs = [
  {
    q: 'Do you deliver outside Douala?',
    a: 'Yes! We deliver to all ten regions of Cameroon. Douala and Yaoundé orders typically arrive within 24–48 hours; other regions within 2–5 business days.',
  },
  {
    q: 'How much does shipping cost?',
    a: 'Shipping is a flat 2,500 XAF nationwide — and completely free for orders above 50,000 XAF.',
  },
  {
    q: 'Are your products genuine?',
    a: 'Every product is sourced from official distributors and comes with the manufacturer warranty plus our own 12-month Klass Computer guarantee.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Visa and Mastercard (via Stripe), MTN Mobile Money, Orange Money, and cash on delivery in select cities.',
  },
  {
    q: 'Can I return a product?',
    a: 'Yes — you have 30 days to return unused products in their original packaging for a full refund or exchange. Defective items are replaced free of charge.',
  },
  {
    q: 'Do you offer technical support after purchase?',
    a: 'Absolutely. Free setup assistance with every purchase, plus same-day repair service at our Douala showroom.',
  },
  {
    q: 'How do I track my order?',
    a: 'Use the Order Tracking page with your order number (KC-XXXXXXX) and the email you used at checkout. You will also receive email updates at every step.',
  },
  {
    q: 'Can I pay in instalments?',
    a: 'For orders above 500,000 XAF we offer flexible payment plans for registered businesses. Contact us for details.',
  },
];

export default function FaqsPage() {
  return (
    <div className="container-klass max-w-3xl py-14">
      <h1 className="text-center text-3xl font-extrabold">Frequently Asked Questions</h1>
      <p className="mt-2 text-center text-sm text-[#555555] dark:text-[#999999]">
        Everything you need to know about shopping with Klass Computer.
      </p>

      <div className="mt-10 space-y-3">
        {faqs.map((faq) => (
          <details key={faq.q} className="card-klass group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              {faq.q}
              <span className="ml-4 text-brand transition-transform group-open:rotate-45 dark:text-brand-light">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[#555555] dark:text-[#999999]">
              {faq.a}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-[#555555] dark:text-[#999999]">Still have questions?</p>
        <Link href="/contact" className="btn-primary mt-3">
          Contact Support
        </Link>
      </div>
    </div>
  );
}
