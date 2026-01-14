export default function MessagesLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-32 animate-pulse rounded bg-background-subtle" />
      </div>

      {/* Conversations skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-4">
            <div className="h-12 w-12 animate-pulse rounded-full bg-background-subtle" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 animate-pulse rounded bg-background-subtle" />
              <div className="h-4 w-48 animate-pulse rounded bg-background-subtle" />
            </div>
            <div className="h-4 w-16 animate-pulse rounded bg-background-subtle" />
          </div>
        ))}
      </div>
    </div>
  );
}
