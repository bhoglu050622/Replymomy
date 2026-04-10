import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="px-6 lg:px-12 py-10 lg:py-16 max-w-3xl mx-auto">
      <div className="mb-10 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-8" />
      <div className="flex gap-2 flex-wrap">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
    </div>
  );
}
