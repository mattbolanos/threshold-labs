import { Skeleton } from "@/components/ui/skeleton";
import { getWeekDays } from "@/lib/utils";

export function DayBlocksSkeleton() {
  const weekDays = getWeekDays(new Date());

  return (
    <div className="hidden grid-cols-7 gap-2 md:grid">
      {weekDays.map((day) => (
        <div
          className="bg-card col-span-1 mx-auto flex w-full flex-col items-center justify-center gap-1 rounded-md border py-1 text-center font-medium"
          key={day.toISOString()}
        >
          <Skeleton className="h-3 w-10" />
          <Skeleton className="mx-auto size-7 rounded-full" />
        </div>
      ))}
    </div>
  );
}
