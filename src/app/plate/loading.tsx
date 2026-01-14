export default function PlateLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Photo gallery skeleton */}
        <div className="space-y-4">
          <div className="aspect-[4/3] animate-pulse rounded-xl bg-background-subtle" />
          <div className="flex gap-2">
            <div className="h-16 w-16 animate-pulse rounded-lg bg-background-subtle" />
            <div className="h-16 w-16 animate-pulse rounded-lg bg-background-subtle" />
            <div className="h-16 w-16 animate-pulse rounded-lg bg-background-subtle" />
          </div>
        </div>

        {/* Details skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-10 w-48 animate-pulse rounded bg-background-subtle" />
            <div className="h-6 w-32 animate-pulse rounded bg-background-subtle" />
          </div>
          <div className="h-12 w-36 animate-pulse rounded-lg bg-background-subtle" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-background-subtle" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-background-subtle" />
          </div>
          <div className="h-12 w-full animate-pulse rounded-xl bg-green/20" />
        </div>
      </div>
    </main>
  );
}
