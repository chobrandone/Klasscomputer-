import { BlogPreview } from '@/components/home/blog-preview';
import { CategoryGrid } from '@/components/home/category-grid';
import { FeatureStrip } from '@/components/home/feature-strip';
import { HeroSlider } from '@/components/home/hero-slider';
import { NewsletterForm } from '@/components/home/newsletter-form';
import { ProductGridSection, ProductRow } from '@/components/home/product-row';
import { PromoBanner } from '@/components/home/promo-banner';
import { Testimonials } from '@/components/home/testimonials';
import { serverApi } from '@/lib/api';
import type { Banner, BlogPost, Category, Product } from '@/lib/types';

export const revalidate = 60;

export default async function HomePage() {
  const [heroBanners, promoBanners, categories, featured, topSellers, newArrivals, blog] =
    await Promise.all([
      serverApi<Banner[]>('/banners?type=hero'),
      serverApi<Banner[]>('/banners?type=promo'),
      serverApi<Category[]>('/categories'),
      serverApi<Product[]>('/products/featured'),
      serverApi<Product[]>('/products/top-sellers'),
      serverApi<Product[]>('/products/new-arrivals'),
      serverApi<{ items: BlogPost[] }>('/blog?limit=3'),
    ]);

  return (
    <>
      <HeroSlider banners={heroBanners || []} />
      <CategoryGrid categories={categories || []} />
      <ProductRow
        title="This Week's Highlights"
        subtitle="Hand-picked deals our customers love"
        products={featured || []}
        href="/shop?isFeatured=true"
      />
      <FeatureStrip />
      <ProductGridSection
        title="Top Sellers"
        subtitle="The most popular tech right now"
        products={(topSellers || []).slice(0, 5)}
        href="/shop?sort=popularity"
        columns={5}
      />
      <PromoBanner banner={(promoBanners || [])[0]} />
      <ProductGridSection
        title="New Arrivals"
        subtitle="Fresh from the warehouse"
        products={(newArrivals || []).slice(0, 8)}
        href="/shop?sort=newest"
      />
      <Testimonials />
      <BlogPreview posts={blog?.items || []} />
      <NewsletterForm />
    </>
  );
}
