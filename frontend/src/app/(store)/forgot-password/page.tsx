'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-klass flex justify-center py-16">
      <div className="card-klass w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold">Reset your password</h1>
        {sent ? (
          <p className="mt-4 rounded bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            ✓ If an account exists for <strong>{email}</strong>, a reset link is on its way.
            Check your inbox (and spam folder).
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-[#555555] dark:text-[#999999]">
              Enter your email and we&apos;ll send you a reset link (valid for 1 hour).
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="input-klass"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-semibold text-brand hover:underline dark:text-brand-light">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
