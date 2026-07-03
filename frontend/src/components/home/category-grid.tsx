import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/lib/types';

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const top = categories.slice(0, 4);
  if (!top.length) return null;

  return (
    <section className="container-klass mt-12">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {top.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-[#141414]"
          >
            {cat.image && (
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h3 className="text-base font-bold text-white sm:text-lg">{cat.name}</h3>
              <p className="text-xs text-white/70">{cat.productCount || 0} products</p>
              <span className="mt-1.5 inline-block text-xs font-semibold text-brand-light transition-transform group-hover:translate-x-1">
                Shop →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
