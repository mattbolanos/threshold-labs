import { LabNotesFeedSkeleton } from "@/components/posts/lab-notes-feed";
import { UpcomingRacesSkeleton } from "@/components/races/upcoming-races";
import { CurrentTrainingBlockSkeleton } from "@/components/training-blocks/current-training-block";
import { Skeleton } from "@/components/ui/skeleton";

export function LabNotesDashboardFallback() {
  return (
    <output
      aria-busy="true"
      aria-label="Loading Lab Notes"
      className="grid items-start gap-6 lg:grid-cols-3"
    >
      <div className="min-w-0 lg:col-span-2">
        <LabNotesFeedSkeleton />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <CurrentTrainingBlockSkeleton />
        <UpcomingRacesSkeleton />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </output>
  );
}
