'use client';

import { Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Contact form is a front-end stub — messages go to the shop email in production.
    setSent(true);
    toast.success("Message sent! We'll reply within 24 hours.");
  }

  return (
    <div className="container-klass py-14">
      <h1 className="text-center text-3xl font-extrabold">Get in Touch</h1>
      <p className="mt-2 text-center text-sm text-[#555555] dark:text-[#999999]">
        Questions about a product, an order or a repair? We&apos;re here to help.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          {[
            { icon: MapPin, title: 'Showroom', lines: ['Akwa, Douala', 'Cameroon'] },
            { icon: Phone, title: 'Phone / WhatsApp', lines: ['+237 670 000 000', 'Mon–Sat, 8:00–18:30'] },
            { icon: Mail, title: 'Email', lines: ['hello@klasscomputer.cm', 'support@klasscomputer.cm'] },
          ].map((item) => (
            <div key={item.title} className="card-klass flex gap-4 p-5">
              <div className="h-fit rounded-full bg-brand/10 p-3 text-brand dark:text-brand-light">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold">{item.title}</p>
                {item.lines.map((line) => (
                  <p key={line} className="text-sm text-[#555555] dark:text-[#999999]">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card-klass p-6 sm:p-8">
          {sent ? (
            <div className="py-16 text-center">
              <p className="text-2xl">✅</p>
              <p className="mt-3 text-lg font-bold">Message received!</p>
              <p className="mt-1 text-sm text-[#555555] dark:text-[#999999]">
                We typically reply within one business day.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" className="input-klass" />
              <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email address" className="input-klass" />
              <input required value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Subject" className="input-klass sm:col-span-2" />
              <textarea required rows={6} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="How can we help?" className="input-klass resize-none sm:col-span-2" />
              <button type="submit" className="btn-primary sm:col-span-2 sm:justify-self-start">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
