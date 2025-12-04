import { Skeleton } from "@/components/ui/skeleton";

export function CalendarBlocksSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-7 lg:gap-2">
      <Skeleton className="mb-1 h-13 w-full lg:hidden" />
      {Array.from({ length: 7 }).map((_, index) => {
        const dayId = `skeleton-day-${index}`;
        return (
          <div className="flex flex-col gap-2" key={dayId}>
            <Skeleton className="mb-2 h-5 w-20 lg:hidden" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, blockIndex) => (
                <Skeleton
                  className="h-20 w-full"
                  key={`${dayId}-block-${blockIndex}`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
