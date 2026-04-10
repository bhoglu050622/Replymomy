import { Skeleton } from "@/components/ui/skeleton";

export default function MatchesLoading() {
  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16">
      <div className="mb-10 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
