import { Skeleton } from "@/components/ui/skeleton";

// Generic loading shimmer shown in the main content area while the initial data
// load is in flight. Deliberately generic (one skeleton for all pages) rather
// than per-page — approximates a header + stat cards + content block. Avoids
// rendering real components with empty data (Rp0 everywhere) during fetch.
export function PageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stat / summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/50 p-5 space-y-3"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Content block (table / cards) */}
      <div className="rounded-2xl border border-border/50 p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
