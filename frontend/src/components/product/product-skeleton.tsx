export function ProductSkeleton() {
  return (
    <div className="card-klass animate-pulse overflow-hidden">
      <div className="aspect-square bg-[#F5F5F5] dark:bg-[#1A1A1A]" />
      <div className="space-y-2 p-3.5">
        <div className="h-2.5 w-1/3 rounded bg-[#F5F5F5] dark:bg-[#1A1A1A]" />
        <div className="h-3.5 w-3/4 rounded bg-[#F5F5F5] dark:bg-[#1A1A1A]" />
        <div className="h-3 w-1/2 rounded bg-[#F5F5F5] dark:bg-[#1A1A1A]" />
        <div className="h-4 w-2/5 rounded bg-[#F5F5F5] dark:bg-[#1A1A1A]" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
