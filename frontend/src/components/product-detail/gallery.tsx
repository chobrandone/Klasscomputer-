'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const list = images?.length ? images : [];

  return (
    <div>
      <div className="group relative aspect-square overflow-hidden rounded-lg border border-[#E0E0E0] bg-[#F5F5F5] dark:border-[#2A2A2A] dark:bg-[#141414]">
        {list[active] && (
          <Image
            src={list[active]}
            alt={`${name} — image ${active + 1}`}
            fill
            priority
            className="object-cover transition-transform duration-300 group-hover:scale-125"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-3">
          {list.map((image, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                'relative h-20 w-20 overflow-hidden rounded border-2 transition-colors',
                i === active
                  ? 'border-brand'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <Image src={image} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
