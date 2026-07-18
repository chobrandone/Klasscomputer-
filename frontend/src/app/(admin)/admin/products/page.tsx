'use client';

import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Brand, Category, ProductList } from '@/lib/types';
import { cn, formatXAF } from '@/lib/utils';
import { useT } from '@/components/layout/i18n-ui';

export default function AdminProductsPage() {
  const { t } = useT();
  const [list, setList] = useState<ProductList | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (brand) params.set('brand', brand);
    api<ProductList>(`/products?${params}`).then(setList).catch(() => undefined);
  }, [page, search, category, brand]);

  useEffect(load, [load]);
  useEffect(() => {
    api<Category[]>('/categories').then(setCategories).catch(() => undefined);
    api<Brand[]>('/brands').then(setBrands).catch(() => undefined);
  }, []);

  async function saveStock(id: string) {
    const value = stockEdits[id];
    if (value === undefined) return;
    try {
      await api(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: Number(value) }),
      });
      toast.success(t('admin.stockUpdated'));
      setStockEdits((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function bulk(action: string) {
    if (!selected.length) return;
    if (action === 'delete' && !confirm(`Delete ${selected.length} products permanently?`)) return;
    try {
      await api('/products/bulk', {
        method: 'POST',
        body: JSON.stringify({ ids: selected, action }),
      });
      toast.success('Done');
      setSelected([]);
      load();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function removeOne(id: string, name: string) {
    if (!confirm(`Delete "${name}" permanently?`)) return;
    await api(`/products/${id}`, { method: 'DELETE' }).catch(() => undefined);
    toast.success('Product deleted');
    load();
  }

  const allCategories = categories.flatMap((c) => [c, ...(c.children || [])]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">{t('admin.products')}</h1>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="h-4 w-4" /> {t('admin.newProduct')}
        </Link>
      </div>

      {/* Filters */}
      <div className="card-klass flex flex-wrap gap-3 p-4">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('admin.searchProducts')}
            className="input-klass !pl-9"
          />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input-klass !w-auto">
          <option value="">{t('admin.allCategories')}</option>
          {allCategories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select value={brand} onChange={(e) => { setBrand(e.target.value); setPage(1); }} className="input-klass !w-auto">
          <option value="">{t('admin.allBrands')}</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="card-klass flex flex-wrap items-center gap-3 border-brand/40 p-3">
          <span className="text-sm font-semibold">{selected.length} {t('admin.selected')}</span>
          <button onClick={() => bulk('feature')} className="btn-outline !py-1.5 text-xs">{t('admin.feature')}</button>
          <button onClick={() => bulk('sale')} className="btn-outline !py-1.5 text-xs">{t('admin.putOnSale')}</button>
          <button onClick={() => bulk('delete')} className="btn-primary !py-1.5 text-xs">{t('common.delete')}</button>
        </div>
      )}

      {/* Table */}
      <div className="card-klass overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-[#E0E0E0] text-left text-xs uppercase tracking-wide text-[#999999] dark:border-[#2A2A2A]">
              <th className="p-3">
                <input
                  type="checkbox"
                  className="accent-brand"
                  checked={selected.length > 0 && selected.length === (list?.items.length || 0)}
                  onChange={(e) =>
                    setSelected(e.target.checked ? (list?.items || []).map((p) => p.id) : [])
                  }
                />
              </th>
              <th className="p-3">{t('admin.product')}</th>
              <th className="p-3">{t('admin.category')}</th>
              <th className="p-3">{t('common.price')}</th>
              <th className="p-3">{t('admin.stock')}</th>
              <th className="p-3">{t('admin.flags')}</th>
              <th className="p-3 text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F5F5] dark:divide-[#2A2A2A]">
            {(list?.items || []).map((product) => (
              <tr key={product.id} className="hover:bg-[#F5F5F5] dark:hover:bg-[#141414]">
                <td className="p-3">
                  <input
                    type="checkbox"
                    className="accent-brand"
                    checked={selected.includes(product.id)}
                    onChange={(e) =>
                      setSelected((prev) =>
                        e.target.checked
                          ? [...prev, product.id]
                          : prev.filter((id) => id !== product.id),
                      )
                    }
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-[#F5F5F5] dark:bg-[#141414]">
                      {product.images?.[0] && (
                        <Image src={product.images[0]} alt="" fill className="object-cover" sizes="40px" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{product.name}</p>
                      <p className="text-xs text-[#999999]">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-[#555555] dark:text-[#999999]">
                  {product.category?.name || '—'}
                </td>
                <td className="p-3 font-semibold">
                  {formatXAF(product.isSale && product.salePrice ? product.salePrice : product.price)}
                  {product.isSale && (
                    <span className="ml-1.5 rounded bg-brand/10 px-1.5 text-[10px] font-bold text-brand">SALE</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      value={stockEdits[product.id] ?? product.stock}
                      onChange={(e) =>
                        setStockEdits((prev) => ({ ...prev, [product.id]: e.target.value }))
                      }
                      className={cn(
                        'w-16 rounded border px-2 py-1 text-xs dark:bg-[#1A1A1A]',
                        product.stock < 5
                          ? 'border-amber-400'
                          : 'border-[#E0E0E0] dark:border-[#2A2A2A]',
                      )}
                    />
                    {stockEdits[product.id] !== undefined && (
                      <button
                        onClick={() => saveStock(product.id)}
                        className="rounded bg-brand px-2 py-1 text-[10px] font-bold text-white"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {product.isFeatured && <span title="Featured">⭐</span>}
                    {product.isNewArrival && <span title="New arrival">🆕</span>}
                    {product.isTopSeller && <span title="Top seller">🔥</span>}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded p-2 text-[#555555] hover:bg-[#E0E0E0] hover:text-brand dark:text-[#999999] dark:hover:bg-[#2A2A2A]"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => removeOne(product.id, product.name)}
                      className="rounded p-2 text-[#555555] hover:bg-[#E0E0E0] hover:text-brand dark:text-[#999999] dark:hover:bg-[#2A2A2A]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {list && list.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: list.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                'h-9 w-9 rounded text-sm font-semibold',
                p === page
                  ? 'bg-brand text-white'
                  : 'border border-[#E0E0E0] dark:border-[#2A2A2A]',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
