export default function CreateLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 animate-pulse rounded bg-background-subtle" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-background-subtle" />
      </div>

      {/* Form skeleton */}
      <div className="space-y-6 rounded-xl border border-border bg-white p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-background-subtle" />
        <div className="space-y-4">
          <div className="h-12 animate-pulse rounded-lg bg-background-subtle" />
          <div className="h-12 animate-pulse rounded-lg bg-background-subtle" />
          <div className="h-24 animate-pulse rounded-lg bg-background-subtle" />
        </div>
      </div>
    </div>
  );
}
