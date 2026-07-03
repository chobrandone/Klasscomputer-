import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { serverApi } from '@/lib/api';
import type { BlogPost } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tech guides, buying advice and news from Klass Computer.',
};
export const revalidate = 120;

export default async function BlogPage() {
  const data = await serverApi<{ items: BlogPost[] }>('/blog?limit=12', 120);
  const posts = data?.items || [];

  return (
    <div className="container-klass py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold">The Klass Blog</h1>
        <p className="mt-2 text-sm text-[#555555] dark:text-[#999999]">
          Buying guides, upgrade tips and tech news for Cameroon.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="card-klass group overflow-hidden transition-shadow hover:shadow"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-[#F5F5F5] dark:bg-[#141414]">
              {post.coverImage && (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              )}
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-1.5">
                {(post.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand dark:text-brand-light"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-2.5 line-clamp-2 text-lg font-bold leading-snug group-hover:text-brand dark:group-hover:text-brand-light">
                {post.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-[#555555] dark:text-[#999999]">
                {post.excerpt}
              </p>
              <p className="mt-3 text-xs text-[#999999]">
                {post.author} · {formatDate(post.createdAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
