import type { Metadata } from 'next';
import { ShopPageContent, type ShopSearchParams } from '@/components/shop/shop-page';

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Browse laptops, desktops, accessories and peripherals at Klass Computer. Filter by brand, price and rating.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;
  return (
    <ShopPageContent
      searchParams={params}
      title={search ? `Search: “${search}”` : 'Shop All Products'}
      description={
        search
          ? `Results matching “${search}”`
          : 'Laptops, desktops, accessories & peripherals — all genuine, all under warranty.'
      }
    />
  );
}
