import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopPageContent, type ShopSearchParams } from '@/components/shop/shop-page';
import { serverApi } from '@/lib/api';
import type { Category } from '@/lib/types';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await serverApi<Category>(`/categories/${slug}`, 300);
  return {
    title: category?.name || 'Category',
    description: `Shop ${category?.name || 'products'} at Klass Computer — genuine products with warranty and fast delivery in Cameroon.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ShopSearchParams>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await serverApi<Category>(`/categories/${slug}`, 300);
  if (!category) notFound();

  return (
    <ShopPageContent
      searchParams={query}
      category={slug}
      title={category.name}
      description={category.description || `Every ${category.name.toLowerCase()} we stock — genuine and under warranty.`}
    />
  );
}
