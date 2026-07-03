'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Address } from '@/lib/types';
import { useAuthStore } from '@/stores/auth-store';

export default function AccountSettingsPage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '' });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: '', phone: '', line1: '', city: '', country: 'Cameroon',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
      });
      api<Address[]>('/users/me/addresses').then(setAddresses).catch(() => undefined);
    }
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(profile),
      });
      setUser(updated);
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    try {
      const saved = await api('/users/me/addresses', {
        method: 'POST',
        body: JSON.stringify(newAddress),
      });
      setAddresses((prev) => [...prev, saved]);
      setNewAddress({ fullName: '', phone: '', line1: '', city: '', country: 'Cameroon' });
      toast.success('Address added');
    } catch (error: any) {
      toast.error(error.message || 'Could not add address');
    }
  }

  async function removeAddress(id?: string) {
    if (!id) return;
    await api(`/users/me/addresses/${id}`, { method: 'DELETE' }).catch(() => undefined);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success('Address removed');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Settings</h1>
        <p className="mt-1 text-sm text-[#555555] dark:text-[#999999]">
          Manage your profile and delivery addresses.
        </p>
      </div>

      <form onSubmit={saveProfile} className="card-klass p-6">
        <h2 className="mb-4 font-bold">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={profile.firstName}
            onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
            placeholder="First name"
            className="input-klass"
          />
          <input
            value={profile.lastName}
            onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
            placeholder="Last name"
            className="input-klass"
          />
          <input value={user?.email || ''} disabled className="input-klass opacity-60 sm:col-span-2" />
          <input
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            placeholder="Phone"
            className="input-klass sm:col-span-2"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary mt-4">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <div className="card-klass p-6">
        <h2 className="mb-4 font-bold">Delivery Addresses</h2>
        {addresses.length > 0 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {addresses.map((address) => (
              <div key={address.id} className="rounded border border-[#E0E0E0] p-4 text-sm dark:border-[#2A2A2A]">
                <p className="font-bold">{address.fullName}</p>
                <p className="mt-1 text-[#555555] dark:text-[#999999]">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ''}
                </p>
                <p className="text-[#555555] dark:text-[#999999]">
                  {address.city}
                  {address.region ? `, ${address.region}` : ''} — {address.country}
                </p>
                {address.phone && <p className="text-[#999999]">{address.phone}</p>}
                <button
                  onClick={() => removeAddress(address.id)}
                  className="mt-2 text-xs font-semibold text-brand hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={addAddress} className="grid gap-3 sm:grid-cols-2">
          <input required value={newAddress.fullName} onChange={(e) => setNewAddress((a) => ({ ...a, fullName: e.target.value }))} placeholder="Full name" className="input-klass" />
          <input value={newAddress.phone} onChange={(e) => setNewAddress((a) => ({ ...a, phone: e.target.value }))} placeholder="Phone" className="input-klass" />
          <input required value={newAddress.line1} onChange={(e) => setNewAddress((a) => ({ ...a, line1: e.target.value }))} placeholder="Street address" className="input-klass sm:col-span-2" />
          <input required value={newAddress.city} onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))} placeholder="City" className="input-klass" />
          <input value={newAddress.region || ''} onChange={(e) => setNewAddress((a) => ({ ...a, region: e.target.value }))} placeholder="Region" className="input-klass" />
          <button type="submit" className="btn-outline sm:col-span-2">
            + Add Address
          </button>
        </form>
      </div>
    </div>
  );
}
