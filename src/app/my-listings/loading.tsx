export default function MyListingsLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-40 animate-pulse rounded bg-background-subtle" />
      </div>

      {/* Tabs skeleton */}
      <div className="mb-6 flex gap-4 border-b border-border pb-4">
        <div className="h-8 w-20 animate-pulse rounded bg-background-subtle" />
        <div className="h-8 w-16 animate-pulse rounded bg-background-subtle" />
        <div className="h-8 w-16 animate-pulse rounded bg-background-subtle" />
      </div>

      {/* Listings skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-xl border border-border p-4">
            <div className="h-20 w-32 animate-pulse rounded-lg bg-background-subtle" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 animate-pulse rounded bg-background-subtle" />
              <div className="h-4 w-24 animate-pulse rounded bg-background-subtle" />
              <div className="h-6 w-20 animate-pulse rounded bg-background-subtle" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
