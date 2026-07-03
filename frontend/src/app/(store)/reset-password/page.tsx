'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: searchParams.get('email'),
          token: searchParams.get('token'),
          password,
        }),
      });
      toast.success('Password updated — you can now sign in');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-klass flex justify-center py-16">
      <div className="card-klass w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold">Choose a new password</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min. 8 characters)"
            className="input-klass"
          />
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="input-klass"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
