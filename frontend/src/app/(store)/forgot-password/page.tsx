'use client';

import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useT } from '@/components/layout/i18n-ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useT();

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
        <h1 className="text-2xl font-extrabold">{t('auth.resetTitle')}</h1>
        {sent ? (
          <p className="mt-4 rounded bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            ✓ <strong>{email}</strong> — {t('auth.resetHint')}
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-[#555555] dark:text-[#999999]">
              {t('auth.resetHint')}
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('common.email')}
                className="input-klass"
              />
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                {loading ? t('auth.sending') : t('auth.sendResetLink')}
              </button>
            </form>
          </>
        )}
        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-semibold text-brand hover:underline dark:text-brand-light">
            {t('auth.backToSignIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
