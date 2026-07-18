'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth-store';
import { useT } from '@/components/layout/i18n-ui';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const { t } = useT();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error(t('auth.passwordsNoMatch'));
      return;
    }
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      });
      toast.success('Account created — welcome to Klass Computer! 🎉');
      router.push('/account');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  }

  return (
    <div className="container-klass flex justify-center py-16">
      <div className="card-klass w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold">{t('auth.createTitle')}</h1>
        <p className="mt-1 text-sm text-[#555555] dark:text-[#999999]">
          {t('auth.createSub')}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input required value={form.firstName} onChange={set('firstName')} placeholder={t('auth.firstName')} className="input-klass" />
            <input required value={form.lastName} onChange={set('lastName')} placeholder={t('auth.lastName')} className="input-klass" />
          </div>
          <input type="email" required value={form.email} onChange={set('email')} placeholder={t('common.email')} className="input-klass" />
          <input value={form.phone} onChange={set('phone')} placeholder={t('auth.phoneOptional')} className="input-klass" />
          <input type="password" required minLength={8} value={form.password} onChange={set('password')} placeholder={t('auth.passwordMin')} className="input-klass" />
          <input type="password" required value={form.confirm} onChange={set('confirm')} placeholder={t('auth.confirmPassword')} className="input-klass" />
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? t('auth.creating') : t('auth.createAccount')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#555555] dark:text-[#999999]">
          {t('auth.haveAccount')}{' '}
          <Link href="/login" className="font-semibold text-brand hover:underline dark:text-brand-light">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
