import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverApi } from '@/lib/api';
import type { BlogPost } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await serverApi<BlogPost>(`/blog/${slug}`, 120);
  return {
    title: post?.title || 'Blog',
    description: post?.excerpt,
    openGraph: post?.coverImage ? { images: [{ url: post.coverImage }] } : undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await serverApi<BlogPost>(`/blog/${slug}`, 120);
  if (!post) notFound();

  return (
    <article className="container-klass max-w-3xl py-10">
      <Link href="/blog" className="text-sm font-semibold text-brand dark:text-brand-light">
        ← All articles
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-sm text-[#999999]">
        {post.author} · {formatDate(post.createdAt)}
      </p>
      {post.coverImage && (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}
      <div
        className="prose-klass mt-8"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />
      <div className="mt-10 rounded-lg bg-[#F5F5F5] p-6 text-center dark:bg-[#141414]">
        <p className="font-bold">Need help choosing the right gear?</p>
        <p className="mt-1 text-sm text-[#555555] dark:text-[#999999]">
          Our team is one message away.
        </p>
        <Link href="/contact" className="btn-primary mt-4">
          Talk to an Expert
        </Link>
      </div>
    </article>
  );
}
