import type { Metadata } from "next";
import { LabNotesDashboard } from "@/components/lab-notes/lab-notes-dashboard";
import { PageHeader } from "@/components/page-header";
import { checkAuth } from "@/lib/auth";
import { preloadAuthQuery } from "@/lib/auth-server";
import { getLabNotesDates } from "@/lib/lab-notes-dates";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = {
  description:
    "Training decisions, observations, and experiments from Threshold Lab.",
  title: "Lab Notes | Threshold Lab",
};

export default async function LabNotesPage() {
  await checkAuth();

  const { oneYearAgo, today } = await getLabNotesDates();
  const [
    preloadedPostsQuery,
    preloadedTrainingBlockQuery,
    preloadedRacesQuery,
    preloadedBaseFitnessQuery,
  ] = await Promise.all([
    preloadAuthQuery(api.posts.getPublishedPosts),
    preloadAuthQuery(api.trainingBlocks.getCurrentTrainingBlock, {
      onDate: today,
    }),
    preloadAuthQuery(api.races.getUpcomingRaces, {
      fromDate: today,
    }),
    preloadAuthQuery(api.workouts.getBaseFitness, {
      from: oneYearAgo,
      to: today,
    }),
  ]);

  return (
    <div className="flex flex-col gap-8 bg-background">
      <PageHeader eyebrow="Threshold Lab" title="Lab Notes" />
      <LabNotesDashboard
        preloadedBaseFitnessQuery={preloadedBaseFitnessQuery}
        preloadedPostsQuery={preloadedPostsQuery}
        preloadedRacesQuery={preloadedRacesQuery}
        preloadedTrainingBlockQuery={preloadedTrainingBlockQuery}
      />
    </div>
  );
}
