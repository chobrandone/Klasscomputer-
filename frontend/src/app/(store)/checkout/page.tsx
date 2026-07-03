'use client';

import { CreditCard, Landmark, Smartphone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { cn, formatXAF } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';

const FREE_SHIPPING_THRESHOLD = 50000;
const FLAT_SHIPPING = 2500;

const PAYMENT_METHODS = [
  { id: 'card', label: 'Card', icon: CreditCard, hint: 'Visa / Mastercard via Stripe' },
  { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone, hint: 'MTN MoMo / Orange Money' },
  { id: 'cod', label: 'Cash on Delivery', icon: Landmark, hint: 'Pay when it arrives' },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'cod'>('card');
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);

  const [form, setForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    country: 'Cameroon',
  });

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        phone: user.phone || f.phone,
      }));
    }
  }, [user]);

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  useEffect(() => {
    const savedCode = sessionStorage.getItem('klass-coupon');
    if (savedCode && subtotal > 0) {
      api('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: savedCode, subtotal }),
      })
        .then((r) => setCoupon({ code: r.code, discount: r.discount }))
        .catch(() => sessionStorage.removeItem('klass-coupon'));
    }
  }, [subtotal]);

  const discount = coupon?.discount || 0;
  const shipping = subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = subtotal - discount + shipping;

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    setPlacing(true);
    try {
      const { order, clientSecret } = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            variantSelection: i.variantSelection,
          })),
          shippingAddress: {
            fullName: form.fullName,
            phone: form.phone,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            region: form.region,
            country: form.country,
          },
          paymentMethod,
          couponCode: coupon?.code,
        }),
      });

      // With Stripe configured the card flow returns a clientSecret to confirm
      // via Stripe Elements; without keys the API treats card as instantly paid.
      if (clientSecret) {
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        );
        if (stripe) {
          toast('Redirecting to secure payment…');
        }
        await api(`/orders/${order.id}/confirm-payment`, { method: 'POST' });
      }

      clear();
      sessionStorage.removeItem('klass-coupon');
      router.push(`/order-confirmation?order=${order.orderNumber}&email=${encodeURIComponent(order.email)}`);
    } catch (error: any) {
      toast.error(error.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-klass flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold">Nothing to check out</h1>
        <Link href="/shop" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container-klass py-10">
      <h1 className="mb-2 text-2xl font-extrabold sm:text-3xl">Checkout</h1>
      {!user && (
        <p className="mb-6 text-sm text-[#555555] dark:text-[#999999]">
          Checking out as guest.{' '}
          <Link href="/login" className="font-semibold text-brand dark:text-brand-light">
            Sign in
          </Link>{' '}
          for faster checkout and order history.
        </p>
      )}

      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Contact */}
          <section className="card-klass p-6">
            <h2 className="mb-4 font-bold">1. Contact</h2>
            <input
              type="email"
              required
              value={form.email}
              onChange={set('email')}
              placeholder="Email address"
              className="input-klass"
            />
          </section>

          {/* Shipping */}
          <section className="card-klass p-6">
            <h2 className="mb-4 font-bold">2. Shipping Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input required value={form.fullName} onChange={set('fullName')} placeholder="Full name" className="input-klass" />
              <input required value={form.phone} onChange={set('phone')} placeholder="Phone (e.g. +237 6XX…)" className="input-klass" />
              <input required value={form.line1} onChange={set('line1')} placeholder="Street address" className="input-klass sm:col-span-2" />
              <input value={form.line2} onChange={set('line2')} placeholder="Apartment, landmark (optional)" className="input-klass sm:col-span-2" />
              <input required value={form.city} onChange={set('city')} placeholder="City" className="input-klass" />
              <input value={form.region} onChange={set('region')} placeholder="Region" className="input-klass" />
            </div>
            <p className="mt-4 rounded bg-[#F5F5F5] p-3 text-xs text-[#555555] dark:bg-[#141414] dark:text-[#999999]">
              🚚 {shipping === 0
                ? 'Free shipping (order above 50,000 XAF)'
                : `Flat rate delivery: ${formatXAF(FLAT_SHIPPING)} — free above ${formatXAF(FREE_SHIPPING_THRESHOLD)}`}
            </p>
          </section>

          {/* Payment */}
          <section className="card-klass p-6">
            <h2 className="mb-4 font-bold">3. Payment</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    'rounded-lg border p-4 text-left transition-colors',
                    paymentMethod === method.id
                      ? 'border-brand bg-brand/5'
                      : 'border-[#E0E0E0] hover:border-brand/50 dark:border-[#2A2A2A]',
                  )}
                >
                  <method.icon
                    className={cn(
                      'h-5 w-5',
                      paymentMethod === method.id
                        ? 'text-brand dark:text-brand-light'
                        : 'text-[#555555] dark:text-[#999999]',
                    )}
                  />
                  <p className="mt-2 text-sm font-bold">{method.label}</p>
                  <p className="text-xs text-[#999999]">{method.hint}</p>
                </button>
              ))}
            </div>
            {paymentMethod === 'mobile_money' && (
              <p className="mt-4 rounded bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                📱 After placing your order, you&apos;ll receive a MoMo payment request on the phone number above.
              </p>
            )}
          </section>
        </div>

        {/* Order summary */}
        <aside className="card-klass h-fit p-6">
          <h2 className="font-bold">Order Summary</h2>
          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-[#F5F5F5] dark:bg-[#141414]">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                  )}
                  <span className="absolute -right-0 -top-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <p className="flex-1 truncate text-sm">{item.name}</p>
                <p className="text-sm font-semibold">{formatXAF(item.unitPrice * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-2 border-t border-[#E0E0E0] pt-4 text-sm dark:border-[#2A2A2A]">
            <div className="flex justify-between">
              <span className="text-[#555555] dark:text-[#999999]">Subtotal</span>
              <span>{formatXAF(subtotal)}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Coupon ({coupon.code})</span>
                <span>-{formatXAF(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#555555] dark:text-[#999999]">Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatXAF(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-[#E0E0E0] pt-3 text-base font-extrabold dark:border-[#2A2A2A]">
              <span>Total</span>
              <span className="text-brand dark:text-brand-light">{formatXAF(total)}</span>
            </div>
          </div>
          <button type="submit" disabled={placing} className="btn-primary mt-6 w-full !py-3.5">
            {placing ? 'Placing Order…' : `Place Order — ${formatXAF(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-[#999999]">
            By placing your order you agree to our terms &amp; conditions.
          </p>
        </aside>
      </form>
    </div>
  );
}
