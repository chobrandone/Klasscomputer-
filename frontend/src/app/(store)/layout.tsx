import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { CartDrawer } from '@/components/layout/cart-drawer';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { serverApi } from '@/lib/api';
import type { Category } from '@/lib/types';

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = (await serverApi<Category[]>('/categories', 300)) || [];

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
