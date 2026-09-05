"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import type { Preloaded } from "convex/react";
import { BaseFitnessSummary } from "@/components/chart/base-fitness-summary";
import {
  LabNotesFeed,
  LabNotesFeedSkeleton,
} from "@/components/posts/lab-notes-feed";
import {
  UpcomingRaces,
  UpcomingRacesSkeleton,
} from "@/components/races/upcoming-races";
import {
  CurrentTrainingBlock,
  CurrentTrainingBlockSkeleton,
} from "@/components/training-blocks/current-training-block";
import type { api } from "../../../convex/_generated/api";

type LabNotesDashboardProps = {
  preloadedBaseFitnessQuery: Preloaded<typeof api.workouts.getBaseFitness>;
  preloadedPostsQuery: Preloaded<typeof api.posts.getPublishedPosts>;
  preloadedRacesQuery: Preloaded<typeof api.races.getUpcomingRaces>;
  preloadedTrainingBlockQuery: Preloaded<
    typeof api.trainingBlocks.getCurrentTrainingBlock
  >;
};

export function LabNotesDashboard({
  preloadedBaseFitnessQuery,
  preloadedPostsQuery,
  preloadedRacesQuery,
  preloadedTrainingBlockQuery,
}: LabNotesDashboardProps) {
  const posts = usePreloadedAuthQuery(preloadedPostsQuery);
  const races = usePreloadedAuthQuery(preloadedRacesQuery);
  const trainingBlock = usePreloadedAuthQuery(preloadedTrainingBlockQuery);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <section
        aria-labelledby="latest-notes"
        className="flex min-w-0 flex-col gap-4 lg:col-span-2"
      >
        <h2 className="sr-only" id="latest-notes">
          Latest notes
        </h2>
        {posts === null || posts === undefined ? (
          <LabNotesFeedSkeleton />
        ) : (
          <LabNotesFeed posts={posts} />
        )}
      </section>

      <aside
        aria-label="Training context"
        className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20"
      >
        {trainingBlock === undefined ? (
          <CurrentTrainingBlockSkeleton />
        ) : (
          <CurrentTrainingBlock block={trainingBlock} />
        )}
        {races === null || races === undefined ? (
          <UpcomingRacesSkeleton />
        ) : (
          <UpcomingRaces races={races} />
        )}
        <BaseFitnessSummary preloadedQuery={preloadedBaseFitnessQuery} />
      </aside>
    </div>
  );
}
