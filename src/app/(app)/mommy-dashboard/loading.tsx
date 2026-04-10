import { Skeleton } from "@/components/ui/skeleton";

export default function MommyDashboardLoading() {
  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-5xl mx-auto">
      <div className="mb-10 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
