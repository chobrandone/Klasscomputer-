'use client';

import { Send } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await api('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      toast.success(res.message || 'Subscribed!');
      setEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-klass mt-16 pb-16">
      <div className="relative overflow-hidden rounded-lg bg-[#0A0A0A] px-6 py-12 text-center sm:px-12">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
        <h2 className="relative text-2xl font-extrabold text-white sm:text-3xl">
          Stay in the Loop
        </h2>
        <p className="relative mx-auto mt-2 max-w-md text-sm text-white/70">
          Subscribe for exclusive deals, new arrivals and tech tips — straight to your inbox.
        </p>
        <form
          onSubmit={subscribe}
          className="relative mx-auto mt-6 flex max-w-md gap-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none placeholder:text-[#999999] focus:border-brand-light"
          />
          <button type="submit" disabled={loading} className="btn-primary shrink-0 !py-3">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{loading ? 'Sending…' : 'Subscribe'}</span>
          </button>
        </form>
      </div>
    </section>
  );
}
