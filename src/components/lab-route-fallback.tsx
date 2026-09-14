import { Skeleton } from "@/components/ui/skeleton";

export function LabRouteFallback() {
  return (
    <output
      aria-busy="true"
      aria-label="Loading page"
      className="flex w-full flex-col gap-6"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </output>
  );
}
