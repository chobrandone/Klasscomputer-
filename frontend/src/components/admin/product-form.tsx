'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Brand, Category, Product } from '@/lib/types';
import { ImageUploader } from './image-uploader';
import { RichTextEditor } from './rich-text-editor';

interface VariantDraft {
  name: string;
  options: { value: string; priceModifier: number }[];
}

interface SpecDraft {
  key: string;
  value: string;
}

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!productId);

  const [form, setForm] = useState({
    name: '',
    shortDescription: '',
    description: '',
    price: '',
    salePrice: '',
    isSale: false,
    stock: '0',
    sku: '',
    weight: '',
    categoryId: '',
    brandId: '',
    isFeatured: false,
    isNewArrival: false,
    isTopSeller: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [specs, setSpecs] = useState<SpecDraft[]>([]);

  useEffect(() => {
    api<Category[]>('/categories').then(setCategories).catch(() => undefined);
    api<Brand[]>('/brands').then(setBrands).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!productId) return;
    api<Product>(`/products/id/${productId}`)
      .then((product) => {
        setForm({
          name: product.name,
          shortDescription: product.shortDescription || '',
          description: product.description || '',
          price: String(product.price),
          salePrice: product.salePrice ? String(product.salePrice) : '',
          isSale: product.isSale,
          stock: String(product.stock),
          sku: product.sku || '',
          weight: product.weight ? String(product.weight) : '',
          categoryId: product.category?.id || '',
          brandId: product.brand?.id || '',
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          isTopSeller: product.isTopSeller,
        });
        setImages(product.images || []);
        setVariants(
          (product.variants || []).map((v) => ({
            name: v.name,
            options: v.options.map((o) => ({ value: o.value, priceModifier: o.priceModifier })),
          })),
        );
        setSpecs(Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value })));
        setLoaded(true);
      })
      .catch(() => toast.error('Could not load product'));
  }, [productId]);

  function set(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        shortDescription: form.shortDescription,
        description: form.description,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        isSale: form.isSale && Boolean(form.salePrice),
        stock: Number(form.stock),
        sku: form.sku || undefined,
        weight: form.weight ? Number(form.weight) : null,
        categoryId: form.categoryId || null,
        brandId: form.brandId || null,
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        isTopSeller: form.isTopSeller,
        images,
        specifications: Object.fromEntries(
          specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value]),
        ),
        variants: variants
          .filter((v) => v.name.trim() && v.options.some((o) => o.value.trim()))
          .map((v) => ({
            name: v.name.trim(),
            options: v.options.filter((o) => o.value.trim()),
          })),
      };
      if (productId) {
        await api(`/products/${productId}`, { method: 'PATCH', body: JSON.stringify(payload) });
        toast.success('Product updated');
      } else {
        await api('/products', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Product created');
      }
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return <div className="card-klass h-96 animate-pulse" />;
  }

  const allCategories = categories.flatMap((c) => [
    c,
    ...(c.children || []).map((ch) => ({ ...ch, name: `— ${ch.name}` })),
  ]);

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Basics */}
        <div className="card-klass space-y-4 p-6">
          <h2 className="font-bold">Basics</h2>
          <input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Product name" className="input-klass" />
          <input value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} placeholder="Short description (shown on cards)" className="input-klass" />
          <RichTextEditor
            value={form.description}
            onChange={(html) => set('description', html)}
            placeholder="Full product description…"
          />
        </div>

        {/* Images */}
        <div className="card-klass p-6">
          <h2 className="mb-4 font-bold">Images</h2>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        {/* Specifications */}
        <div className="card-klass p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Specifications</h2>
            <button
              type="button"
              onClick={() => setSpecs((s) => [...s, { key: '', value: '' }])}
              className="btn-outline !py-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Row
            </button>
          </div>
          <div className="space-y-2">
            {specs.map((spec, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={spec.key}
                  onChange={(e) => setSpecs((s) => s.map((row, idx) => (idx === i ? { ...row, key: e.target.value } : row)))}
                  placeholder="Name (e.g. Processor)"
                  className="input-klass"
                />
                <input
                  value={spec.value}
                  onChange={(e) => setSpecs((s) => s.map((row, idx) => (idx === i ? { ...row, value: e.target.value } : row)))}
                  placeholder="Value (e.g. Intel Core i7)"
                  className="input-klass"
                />
                <button type="button" onClick={() => setSpecs((s) => s.filter((_, idx) => idx !== i))} className="shrink-0 p-2 text-[#999999] hover:text-brand">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div className="card-klass p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Variants</h2>
            <button
              type="button"
              onClick={() => setVariants((v) => [...v, { name: '', options: [{ value: '', priceModifier: 0 }] }])}
              className="btn-outline !py-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Variant Group
            </button>
          </div>
          <div className="space-y-5">
            {variants.map((variant, vi) => (
              <div key={vi} className="rounded border border-[#E0E0E0] p-4 dark:border-[#2A2A2A]">
                <div className="flex gap-2">
                  <input
                    value={variant.name}
                    onChange={(e) => setVariants((v) => v.map((row, idx) => (idx === vi ? { ...row, name: e.target.value } : row)))}
                    placeholder='Group name (e.g. "RAM", "Color")'
                    className="input-klass"
                  />
                  <button type="button" onClick={() => setVariants((v) => v.filter((_, idx) => idx !== vi))} className="shrink-0 p-2 text-[#999999] hover:text-brand">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {variant.options.map((option, oi) => (
                    <div key={oi} className="flex gap-2">
                      <input
                        value={option.value}
                        onChange={(e) =>
                          setVariants((v) =>
                            v.map((row, idx) =>
                              idx === vi
                                ? { ...row, options: row.options.map((o, oidx) => (oidx === oi ? { ...o, value: e.target.value } : o)) }
                                : row,
                            ),
                          )
                        }
                        placeholder='Option (e.g. "16GB")'
                        className="input-klass"
                      />
                      <input
                        type="number"
                        value={option.priceModifier}
                        onChange={(e) =>
                          setVariants((v) =>
                            v.map((row, idx) =>
                              idx === vi
                                ? { ...row, options: row.options.map((o, oidx) => (oidx === oi ? { ...o, priceModifier: Number(e.target.value) } : o)) }
                                : row,
                            ),
                          )
                        }
                        placeholder="+ XAF"
                        className="input-klass !w-32"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setVariants((v) =>
                            v.map((row, idx) =>
                              idx === vi ? { ...row, options: row.options.filter((_, oidx) => oidx !== oi) } : row,
                            ),
                          )
                        }
                        className="shrink-0 p-2 text-[#999999] hover:text-brand"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setVariants((v) =>
                        v.map((row, idx) =>
                          idx === vi
                            ? { ...row, options: [...row.options, { value: '', priceModifier: 0 }] }
                            : row,
                        ),
                      )
                    }
                    className="text-xs font-semibold text-brand hover:underline dark:text-brand-light"
                  >
                    + Add option
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="card-klass space-y-4 p-6">
          <h2 className="font-bold">Pricing & Stock</h2>
          <label className="block text-xs font-semibold text-[#555555] dark:text-[#999999]">
            Price (XAF)
            <input type="number" required min={0} value={form.price} onChange={(e) => set('price', e.target.value)} className="input-klass mt-1" />
          </label>
          <label className="block text-xs font-semibold text-[#555555] dark:text-[#999999]">
            Sale price (XAF)
            <input type="number" min={0} value={form.salePrice} onChange={(e) => set('salePrice', e.target.value)} className="input-klass mt-1" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isSale} onChange={(e) => set('isSale', e.target.checked)} className="accent-brand" />
            On sale
          </label>
          <label className="block text-xs font-semibold text-[#555555] dark:text-[#999999]">
            Stock
            <input type="number" required min={0} value={form.stock} onChange={(e) => set('stock', e.target.value)} className="input-klass mt-1" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-[#555555] dark:text-[#999999]">
              SKU
              <input value={form.sku} onChange={(e) => set('sku', e.target.value)} className="input-klass mt-1" />
            </label>
            <label className="block text-xs font-semibold text-[#555555] dark:text-[#999999]">
              Weight (kg)
              <input type="number" step="0.01" value={form.weight} onChange={(e) => set('weight', e.target.value)} className="input-klass mt-1" />
            </label>
          </div>
        </div>

        <div className="card-klass space-y-4 p-6">
          <h2 className="font-bold">Organisation</h2>
          <label className="block text-xs font-semibold text-[#555555] dark:text-[#999999]">
            Category
            <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} className="input-klass mt-1">
              <option value="">— None —</option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-[#555555] dark:text-[#999999]">
            Brand
            <select value={form.brandId} onChange={(e) => set('brandId', e.target.value)} className="input-klass mt-1">
              <option value="">— None —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="card-klass space-y-3 p-6">
          <h2 className="font-bold">Visibility</h2>
          {(
            [
              ['isFeatured', '⭐ Featured (homepage highlights)'],
              ['isNewArrival', '🆕 New arrival'],
              ['isTopSeller', '🔥 Top seller'],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(form as any)[field]}
                onChange={(e) => set(field, e.target.checked)}
                className="accent-brand"
              />
              {label}
            </label>
          ))}
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full !py-3">
          {saving ? 'Saving…' : productId ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
