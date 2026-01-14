export default function PlatesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-10 w-64 animate-pulse rounded bg-background-subtle" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-background-subtle" />
      </div>

      {/* Filter bar skeleton */}
      <div className="mb-6 flex gap-2">
        <div className="h-10 w-24 animate-pulse rounded-lg bg-background-subtle" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-background-subtle" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-background-subtle" />
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border p-4">
            <div className="aspect-[2/1] animate-pulse rounded-lg bg-background-subtle" />
            <div className="h-5 w-24 animate-pulse rounded bg-background-subtle" />
            <div className="h-6 w-20 animate-pulse rounded bg-background-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}
