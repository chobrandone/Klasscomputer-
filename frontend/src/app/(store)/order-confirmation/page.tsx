import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Order Confirmed' };

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; email?: string }>;
}) {
  const { order, email } = await searchParams;

  return (
    <div className="container-klass flex flex-col items-center py-24 text-center">
      <div className="rounded-full bg-green-100 p-5 dark:bg-green-900/30">
        <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold">Thank you for your order! 🎉</h1>
      {order && (
        <p className="mt-3 text-[#555555] dark:text-[#999999]">
          Order number:{' '}
          <span className="font-mono font-bold text-brand dark:text-brand-light">{order}</span>
        </p>
      )}
      <p className="mt-2 max-w-md text-sm text-[#555555] dark:text-[#999999]">
        A confirmation email {email ? `has been sent to ${email}` : 'is on its way'}. We&apos;ll
        notify you again as soon as your order ships.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href={order ? `/order-tracking?order=${order}${email ? `&email=${encodeURIComponent(email)}` : ''}` : '/order-tracking'}
          className="btn-outline"
        >
          Track Order
        </Link>
        <Link href="/shop" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
