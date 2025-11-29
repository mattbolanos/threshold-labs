import { Skeleton } from "@/components/ui/skeleton";

export function DayBlocksSkeleton() {
  return (
    <div className="hidden grid-cols-7 gap-2 md:grid">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          className="bg-card col-span-1 mx-auto flex w-full flex-col items-center justify-center gap-1 rounded-md border py-1 text-center font-medium"
          key={i}
        >
          <Skeleton className="h-3 w-10" />
          <Skeleton className="mx-auto size-7 rounded-full" />
        </div>
      ))}
    </div>
  );
}