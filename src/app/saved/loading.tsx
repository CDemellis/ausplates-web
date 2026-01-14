export default function SavedLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-40 animate-pulse rounded bg-background-subtle" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-background-subtle" />
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
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
