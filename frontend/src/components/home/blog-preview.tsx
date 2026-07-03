import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function BlogPreview({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;

  return (
    <section className="container-klass mt-14">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="section-title">From the Blog</h2>
          <p className="mt-1 text-sm text-[#555555] dark:text-[#999999]">
            Buying guides, tips and tech news
          </p>
        </div>
        <Link
          href="/blog"
          className="text-sm font-semibold text-brand hover:underline dark:text-brand-light"
        >
          All articles →
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
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
              <p className="text-xs text-[#999999]">{formatDate(post.createdAt)}</p>
              <h3 className="mt-1.5 line-clamp-2 font-bold leading-snug group-hover:text-brand dark:group-hover:text-brand-light">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-[#555555] dark:text-[#999999]">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
