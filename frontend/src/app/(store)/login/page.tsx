'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth-store';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.firstName}!`);
      const next = searchParams.get('next');
      router.push(next || (user.role === 'customer' ? '/account' : '/admin'));
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  }

  return (
    <div className="container-klass flex justify-center py-16">
      <div className="card-klass w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1 text-sm text-[#555555] dark:text-[#999999]">
          Sign in to your Klass Computer account
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
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input-klass"
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-brand hover:underline dark:text-brand-light"
            >
              Forgot password?
            </Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#555555] dark:text-[#999999]">
          New here?{' '}
          <Link href="/register" className="font-semibold text-brand hover:underline dark:text-brand-light">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
