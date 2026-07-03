import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-[#0A0A0A]">
      <p className="text-7xl font-extrabold text-brand dark:text-brand-light">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-black dark:text-white">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[#555555] dark:text-[#999999]">
        The page you&apos;re looking for was moved, deleted or never existed. Let&apos;s get
        you back to the good stuff.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-outline">Go Home</Link>
        <Link href="/shop" className="btn-primary">Browse Shop</Link>
      </div>
    </div>
  );
}
