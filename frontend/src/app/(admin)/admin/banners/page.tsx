'use client';

import { Pencil, Plus, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ImageUploader } from '@/components/admin/image-uploader';
import { api } from '@/lib/api';
import type { Banner } from '@/lib/types';
import { cn } from '@/lib/utils';

const EMPTY = {
  type: 'hero' as 'hero' | 'promo',
  title: '',
  subtitle: '',
  tag: '',
  image: '',
  link: '',
  ctaLabel: '',
  active: true,
  sortOrder: 0,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(() => {
    api<Banner[]>('/banners?all=true').then(setBanners).catch(() => undefined);
  }, []);
  useEffect(load, [load]);

  function openForm(banner?: Banner) {
    setEditing(banner || null);
    setForm(banner ? { ...EMPTY, ...banner } : EMPTY);
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await api(`/banners/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
        toast.success('Banner updated');
      } else {
        await api('/banners', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Banner created');
      }
      setShowForm(false);
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function toggleActive(banner: Banner) {
    await api(`/banners/${banner.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ active: !banner.active }),
    }).catch(() => undefined);
    load();
  }

  async function remove(banner: Banner) {
    if (!confirm(`Delete banner "${banner.title}"?`)) return;
    await api(`/banners/${banner.id}`, { method: 'DELETE' }).catch(() => undefined);
    toast.success('Banner deleted');
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Banners</h1>
        <button onClick={() => openForm()} className="btn-primary">
          <Plus className="h-4 w-4" /> New Banner
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {banners.map((banner) => (
          <div key={banner.id} className="card-klass overflow-hidden">
            <div className="relative flex aspect-[16/6] items-center bg-[#0A0A0A]">
              {banner.image && (
                <Image src={banner.image} alt={banner.title} fill className="object-cover opacity-50" sizes="600px" />
              )}
              <div className="relative z-10 px-5">
                <span className="rounded bg-brand px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  {banner.type}
                </span>
                <p className="mt-1.5 font-extrabold text-white">{banner.title}</p>
                <p className="line-clamp-1 text-xs text-white/70">{banner.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3">
              <button
                onClick={() => toggleActive(banner)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold',
                  banner.active
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-[#F5F5F5] text-[#999999] dark:bg-[#2A2A2A]',
                )}
              >
                {banner.active ? '● Active' : '○ Inactive'}
              </button>
              <div className="flex gap-1">
                <button onClick={() => openForm(banner)} className="p-2 text-[#999999] hover:text-brand">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(banner)} className="p-2 text-[#999999] hover:text-brand">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <form onSubmit={save} className="card-klass my-8 w-full max-w-lg space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{editing ? 'Edit Banner' : 'New Banner'}</h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                className="input-klass"
              >
                <option value="hero">Hero slider</option>
                <option value="promo">Promo banner</option>
              </select>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                placeholder="Sort order"
                className="input-klass"
              />
            </div>
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="input-klass" />
            <input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} placeholder="Subtitle" className="input-klass" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))} placeholder='Tag (e.g. "New Arrivals")' className="input-klass" />
              <input value={form.ctaLabel} onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))} placeholder="CTA label" className="input-klass" />
            </div>
            <input value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} placeholder="Link (e.g. /category/laptops)" className="input-klass" />
            <ImageUploader
              images={form.image ? [form.image] : []}
              onChange={(urls) => setForm((f) => ({ ...f, image: urls[urls.length - 1] || '' }))}
              max={1}
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="accent-brand" />
              Active
            </label>
            <button type="submit" className="btn-primary w-full">
              {editing ? 'Save Changes' : 'Create Banner'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
