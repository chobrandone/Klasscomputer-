'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center dark:bg-[#0A0A0A]">
      <p className="text-7xl">⚡</p>
      <h1 className="mt-4 text-2xl font-extrabold text-black dark:text-white">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[#555555] dark:text-[#999999]">
        An unexpected error occurred. It&apos;s not you, it&apos;s us — try again in a moment.
      </p>
      <button onClick={reset} className="btn-primary mt-6">
        Try Again
      </button>
    </div>
  );
}
