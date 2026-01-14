export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-32 animate-pulse rounded bg-background-subtle" />
      </div>

      {/* Avatar section skeleton */}
      <div className="mb-8 flex items-center gap-6">
        <div className="h-24 w-24 animate-pulse rounded-full bg-background-subtle" />
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-background-subtle" />
          <div className="h-4 w-48 animate-pulse rounded bg-background-subtle" />
        </div>
      </div>

      {/* Form sections skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-6">
            <div className="mb-4 h-6 w-40 animate-pulse rounded bg-background-subtle" />
            <div className="space-y-4">
              <div className="h-12 animate-pulse rounded-lg bg-background-subtle" />
              <div className="h-12 animate-pulse rounded-lg bg-background-subtle" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
