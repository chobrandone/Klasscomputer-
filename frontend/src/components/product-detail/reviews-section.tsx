'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RatingStars } from '@/components/product/rating-stars';
import { api } from '@/lib/api';
import type { ReviewSummary } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useT } from '@/components/layout/i18n-ui';

export function ReviewsSection({ productId }: { productId: string }) {
  const { t } = useT();
  const [data, setData] = useState<ReviewSummary | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);

  const load = useCallback(() => {
    api<ReviewSummary>(`/reviews/product/${productId}`)
      .then(setData)
      .catch(() => undefined);
  }, [productId]);

  useEffect(load, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api('/reviews', {
        method: 'POST',
        body: JSON.stringify({ productId, rating, title, comment }),
      });
      toast.success(t('reviews.thanks'));
      setTitle('');
      setComment('');
      load();
    } catch (error: any) {
      toast.error(error.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) {
    return <p className="text-sm text-[#999999]">{t('common.loading')}</p>;
  }

  const maxCount = Math.max(...data.breakdown.map((b) => b.count), 1);

  return (
    <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
      {/* Summary + breakdown */}
      <div>
        <div className="card-klass p-6 text-center">
          <p className="text-4xl font-extrabold">{data.average || '—'}</p>
          <div className="mt-2 flex justify-center">
            <RatingStars rating={data.average} size="md" />
          </div>
          <p className="mt-1 text-sm text-[#999999]">
            {data.total} {t('reviews.count')}
          </p>
        </div>
        <div className="mt-4 space-y-2">
          {data.breakdown.map((row) => (
            <div key={row.star} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-[#555555] dark:text-[#999999]">{row.star}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F5F5F5] dark:bg-[#2A2A2A]">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${(row.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right text-xs text-[#999999]">{row.count}</span>
            </div>
          ))}
        </div>

        {/* Write a review */}
        <div className="card-klass mt-6 p-5">
          <h3 className="font-bold">{t('reviews.writeReview')}</h3>
          {!user ? (
            <p className="mt-2 text-sm text-[#555555] dark:text-[#999999]">
              <Link href="/login" className="font-semibold text-brand dark:text-brand-light">
                {t('reviews.signIn')}
              </Link>{' '}
              {t('reviews.signInToReview')}
            </p>
          ) : (
            <form onSubmit={submit} className="mt-3 space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`${star} stars`}
                  >
                    <Star
                      className={cn(
                        'h-6 w-6 transition-colors',
                        star <= rating
                          ? 'fill-amber-500 text-amber-500'
                          : 'fill-[#E0E0E0] text-[#E0E0E0] dark:fill-[#2A2A2A] dark:text-[#2A2A2A]',
                      )}
                    />
                  </button>
                ))}
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('reviews.titlePlaceholder')}
                className="input-klass"
              />
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('reviews.commentPlaceholder')}
                rows={3}
                className="input-klass resize-none"
              />
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? t('reviews.submitting') : t('reviews.submit')}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Review list */}
      <div>
        {data.reviews.length === 0 ? (
          <p className="text-sm text-[#999999]">{t('reviews.none')}</p>
        ) : (
          <div className="space-y-5">
            {data.reviews.map((review) => (
              <div key={review.id} className="card-klass p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{review.author}</p>
                      <p className="text-xs text-[#999999]">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <RatingStars rating={review.rating} />
                </div>
                {review.title && <p className="mt-3 text-sm font-semibold">{review.title}</p>}
                <p className="mt-1 text-sm leading-relaxed text-[#555555] dark:text-[#999999]">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
