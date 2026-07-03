import { SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import { serverApi } from '@/lib/api';
import type { Brand, Category, ProductList } from '@/lib/types';
import { FiltersSidebar } from './filters-sidebar';
import { Pagination } from './pagination';
import { ShopToolbar } from './shop-toolbar';

export interface ShopSearchParams {
  [key: string]: string | string[] | undefined;
}

function buildQuery(searchParams: ShopSearchParams, category?: string) {
  const params = new URLSearchParams();
  const keys = [
    'search', 'brand', 'minPrice', 'maxPrice', 'rating',
    'sort', 'page', 'isSale', 'isFeatured', 'inStock',
  ];
  for (const key of keys) {
    const value = searchParams[key];
    if (typeof value === 'string' && value) params.set(key, value);
  }
  if (category) params.set('category', category);
  params.set('limit', '12');
  return params.toString();
}

export async function ShopPageContent({
  searchParams,
  category,
  title,
  description,
}: {
  searchParams: ShopSearchParams;
  category?: string;
  title: string;
  description?: string;
}) {
  const query = buildQuery(searchParams, category);
  const [products, categories, brands] = await Promise.all([
    serverApi<ProductList>(`/products?${query}`, 60),
    serverApi<Category[]>('/categories', 300),
    serverApi<Brand[]>('/brands', 300),
  ]);

  const list = products || { items: [], total: 0, page: 1, pages: 0, limit: 12 };
  const view = searchParams.view === 'list' ? 'list' : 'grid';

  return (
    <div className="container-klass py-8">
      {/* Page header */}
      <div className="mb-8 rounded-lg bg-[#0A0A0A] px-6 py-8 sm:px-10">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{title}</h1>
        <p className="mt-1.5 text-sm text-white/60">
          {description || 'Genuine tech, honest prices, nationwide delivery.'}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar (collapsible on mobile) */}
        <details className="group lg:hidden">
          <summary className="btn-outline mb-4 flex cursor-pointer list-none items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </summary>
          <div className="card-klass mb-6 p-5">
            <FiltersSidebar
              categories={categories || []}
              brands={brands || []}
              activeCategory={category}
            />
          </div>
        </details>
        <div className="hidden lg:block">
          <FiltersSidebar
            categories={categories || []}
            brands={brands || []}
            activeCategory={category}
          />
        </div>

        <div>
          <ShopToolbar total={list.total} />
          {list.items.length === 0 ? (
            <div className="card-klass flex flex-col items-center gap-2 py-20 text-center">
              <p className="text-lg font-bold">No products found</p>
              <p className="text-sm text-[#999999]">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : view === 'list' ? (
            <div className="space-y-4">
              {list.items.map((product) => (
                <ProductCard key={product.id} product={product} layout="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <Pagination page={list.page} pages={list.pages} />
        </div>
      </div>
    </div>
  );
}
