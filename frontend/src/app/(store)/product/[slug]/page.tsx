import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductRow } from '@/components/home/product-row';
import { ProductGallery } from '@/components/product-detail/gallery';
import { ProductTabs } from '@/components/product-detail/product-tabs';
import { PurchasePanel } from '@/components/product-detail/purchase-panel';
import { PriceTag } from '@/components/product/price-tag';
import { RatingStars } from '@/components/product/rating-stars';
import { serverApi } from '@/lib/api';
import type { Product } from '@/lib/types';
import { discountPercent, formatXAF } from '@/lib/utils';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await serverApi<Product>(`/products/${slug}`);
  if (!product) return { title: 'Product' };
  return {
    title: product.name,
    description: product.shortDescription || product.name,
    openGraph: {
      title: `${product.name} | Klass Computer`,
      description: product.shortDescription || '',
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, related] = await Promise.all([
    serverApi<Product>(`/products/${slug}`),
    serverApi<Product[]>(`/products/${slug}/related`),
  ]);
  if (!product) notFound();

  const discount = discountPercent(product);

  return (
    <div className="container-klass py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-xs text-[#999999]">
        <Link href="/" className="hover:text-brand">Home</Link>
        <span className="mx-1.5">/</span>
        <Link href="/shop" className="hover:text-brand">Shop</Link>
        {product.category && (
          <>
            <span className="mx-1.5">/</span>
            <Link href={`/category/${product.category.slug}`} className="hover:text-brand">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-1.5">/</span>
        <span className="text-[#555555] dark:text-[#999999]">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images || []} name={product.name} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-light">
            {product.brand?.name}
          </p>
          <h1 className="mt-1.5 text-2xl font-extrabold leading-tight sm:text-3xl">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <RatingStars rating={product.ratings} count={product.reviewCount} size="md" />
            {product.sku && <span className="text-xs text-[#999999]">SKU: {product.sku}</span>}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <PriceTag product={product} size="lg" />
            {discount > 0 && (
              <span className="rounded bg-brand px-2.5 py-1 text-xs font-bold text-white">
                SAVE {formatXAF(product.price - (product.salePrice || 0))}
              </span>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-4 leading-relaxed text-[#555555] dark:text-[#999999]">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-7 border-t border-[#E0E0E0] pt-7 dark:border-[#2A2A2A]">
            <PurchasePanel product={product} />
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3 rounded-lg bg-[#F5F5F5] p-4 text-center text-xs dark:bg-[#141414]">
            <div>🚚 <span className="mt-1 block font-semibold">Fast Delivery</span></div>
            <div>🛡️ <span className="mt-1 block font-semibold">12-Month Warranty</span></div>
            <div>↩️ <span className="mt-1 block font-semibold">30-Day Returns</span></div>
          </div>
        </div>
      </div>

      <ProductTabs product={product} />

      <ProductRow
        title="You Might Also Like"
        products={related || []}
      />
    </div>
  );
}
