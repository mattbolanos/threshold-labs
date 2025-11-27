import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-64 w-full flex-col gap-4 sm:h-80", className)}>
      {/* Legend placeholder */}
      <div className="flex items-center gap-4 pt-2 pl-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="px-2">
        <Skeleton className="h-52 w-full sm:h-64" />
      </div>
    </div>
  );
}
