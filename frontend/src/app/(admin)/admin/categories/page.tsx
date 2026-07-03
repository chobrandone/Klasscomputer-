'use client';

import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ImageUploader } from '@/components/admin/image-uploader';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [tree, setTree] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', parentId: '', description: '', image: '' });

  const load = useCallback(() => {
    api<Category[]>('/categories').then(setTree).catch(() => undefined);
  }, []);
  useEffect(load, [load]);

  function openForm(category?: Category, parentId?: string) {
    setEditing(category || null);
    setForm({
      name: category?.name || '',
      parentId: parentId || (category?.parent as any)?.id || '',
      description: category?.description || '',
      image: category?.image || '',
    });
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        parentId: form.parentId || null,
        description: form.description,
        image: form.image || undefined,
      };
      if (editing) {
        await api(`/categories/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        toast.success('Category updated');
      } else {
        await api('/categories', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Category created');
      }
      setShowForm(false);
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function remove(category: Category) {
    if (!confirm(`Delete "${category.name}"? Products in it will become uncategorised.`)) return;
    await api(`/categories/${category.id}`, { method: 'DELETE' }).catch(() => undefined);
    toast.success('Category deleted');
    load();
  }

  function Row({ category, depth }: { category: Category; depth: number }) {
    return (
      <>
        <div
          className="flex items-center justify-between px-5 py-3 hover:bg-[#F5F5F5] dark:hover:bg-[#141414]"
          style={{ paddingLeft: 20 + depth * 28 }}
        >
          <div>
            <span className="font-semibold">{category.name}</span>
            <span className="ml-2 text-xs text-[#999999]">
              /{category.slug} · {category.productCount ?? 0} products
            </span>
          </div>
          <div className="flex gap-1">
            {depth === 0 && (
              <button
                onClick={() => openForm(undefined, category.id)}
                title="Add subcategory"
                className="rounded p-2 text-[#555555] hover:bg-[#E0E0E0] hover:text-brand dark:text-[#999999] dark:hover:bg-[#2A2A2A]"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => openForm(category)}
              className="rounded p-2 text-[#555555] hover:bg-[#E0E0E0] hover:text-brand dark:text-[#999999] dark:hover:bg-[#2A2A2A]"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => remove(category)}
              className="rounded p-2 text-[#555555] hover:bg-[#E0E0E0] hover:text-brand dark:text-[#999999] dark:hover:bg-[#2A2A2A]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {(category.children || []).map((child) => (
          <Row key={child.id} category={child} depth={depth + 1} />
        ))}
      </>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Categories</h1>
        <button onClick={() => openForm()} className="btn-primary">
          <Plus className="h-4 w-4" /> New Category
        </button>
      </div>

      <div className="card-klass divide-y divide-[#F5F5F5] dark:divide-[#2A2A2A]">
        {tree.map((category) => (
          <Row key={category.id} category={category} depth={0} />
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={save} className="card-klass w-full max-w-md space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{editing ? 'Edit Category' : 'New Category'}</h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Category name"
              className="input-klass"
            />
            <select
              value={form.parentId}
              onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
              className="input-klass"
            >
              <option value="">— Top level —</option>
              {tree
                .filter((c) => c.id !== editing?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>Under: {c.name}</option>
                ))}
            </select>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short description (optional)"
              className="input-klass"
            />
            <ImageUploader
              images={form.image ? [form.image] : []}
              onChange={(urls) => setForm((f) => ({ ...f, image: urls[urls.length - 1] || '' }))}
              max={1}
            />
            <button type="submit" className="btn-primary w-full">
              {editing ? 'Save Changes' : 'Create Category'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
