import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-smoke animate-pulse",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 animate-skeleton-sweep bg-gradient-to-r from-transparent via-champagne/5 to-transparent" />
    </div>
  )
}

export { Skeleton }
