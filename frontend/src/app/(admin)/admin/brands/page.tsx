'use client';

import { Pencil, Plus, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ImageUploader } from '@/components/admin/image-uploader';
import { api } from '@/lib/api';
import type { Brand } from '@/lib/types';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', logo: '' });

  const load = useCallback(() => {
    api<Brand[]>('/brands').then(setBrands).catch(() => undefined);
  }, []);
  useEffect(load, [load]);

  function openForm(brand?: Brand) {
    setEditing(brand || null);
    setForm({ name: brand?.name || '', logo: brand?.logo || '' });
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await api(`/brands/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
        toast.success('Brand updated');
      } else {
        await api('/brands', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Brand created');
      }
      setShowForm(false);
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function remove(brand: Brand) {
    if (!confirm(`Delete brand "${brand.name}"?`)) return;
    await api(`/brands/${brand.id}`, { method: 'DELETE' }).catch(() => undefined);
    toast.success('Brand deleted');
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Brands</h1>
        <button onClick={() => openForm()} className="btn-primary">
          <Plus className="h-4 w-4" /> New Brand
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {brands.map((brand) => (
          <div key={brand.id} className="card-klass flex items-center gap-3 p-4">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-[#F5F5F5] dark:bg-[#141414]">
              {brand.logo ? (
                <Image src={brand.logo} alt={brand.name} fill className="object-contain" sizes="44px" />
              ) : (
                <span className="flex h-full items-center justify-center font-bold text-[#999999]">
                  {brand.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{brand.name}</p>
              <p className="text-xs text-[#999999]">/{brand.slug}</p>
            </div>
            <button onClick={() => openForm(brand)} className="p-1.5 text-[#999999] hover:text-brand">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => remove(brand)} className="p-1.5 text-[#999999] hover:text-brand">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={save} className="card-klass w-full max-w-md space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{editing ? 'Edit Brand' : 'New Brand'}</h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Brand name"
              className="input-klass"
            />
            <ImageUploader
              images={form.logo ? [form.logo] : []}
              onChange={(urls) => setForm((f) => ({ ...f, logo: urls[urls.length - 1] || '' }))}
              max={1}
            />
            <button type="submit" className="btn-primary w-full">
              {editing ? 'Save Changes' : 'Create Brand'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
