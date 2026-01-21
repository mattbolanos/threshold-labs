import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function BlockSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-start gap-3">
        {/* Title with icon */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-5 rounded-md" />
          <Skeleton className="h-5 w-32" />
        </div>
        {/* Time and progress */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="size-7 rounded-full" />
        </div>
        {/* Tags */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

interface DayColumnSkeletonProps {
  showHeader?: boolean;
}

function DayColumnSkeleton({ showHeader = false }: DayColumnSkeletonProps) {
  return (
    <div className="flex min-h-[300px] flex-col gap-2 lg:min-h-[400px]">
      {showHeader && <Skeleton className="mb-2 h-5 w-48 lg:hidden" />}
      <div className="flex flex-col gap-2">
        <BlockSkeleton />
        <BlockSkeleton />
      </div>
    </div>
  );
}

export function WeekSkeleton() {
  return (
    <>
      {/* Mobile: show only first day column */}
      <div className="flex lg:hidden">
        <DayColumnSkeleton showHeader />
      </div>
      {/* Desktop: show all 7 day columns */}
      <div className="hidden lg:contents">
        {Array.from({ length: 7 }).map((_, i) => (
          <DayColumnSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
