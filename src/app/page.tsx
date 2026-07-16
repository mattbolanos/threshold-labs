import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { BaseFitnessSummary } from "@/components/chart/base-fitness-summary";
import { PageHeader } from "@/components/page-header";
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
import { checkAuth } from "@/lib/auth";
import { getTodayDate } from "@/lib/race-dates";
import { api } from "../../convex/_generated/api";

export const metadata: Metadata = {
  description:
    "Training decisions, observations, and experiments from Threshold Lab.",
  title: "Lab Notes | Threshold Lab",
};

async function UpcomingRacesContent() {
  await connection();
  const races = await fetchQuery(api.races.getUpcomingRaces, {
    fromDate: getTodayDate(),
  });

  return <UpcomingRaces races={races} />;
}

async function CurrentTrainingBlockContent() {
  await connection();
  const block = await fetchQuery(api.trainingBlocks.getCurrentTrainingBlock, {
    onDate: getTodayDate(),
  });

  return <CurrentTrainingBlock block={block} />;
}

async function LabNotesContent() {
  await connection();
  const posts = await fetchQuery(api.posts.getPublishedPosts);

  return <LabNotesFeed posts={posts} />;
}

export default async function LabNotesPage() {
  await checkAuth({ allowUnauthenticatedPreview: true });

  return (
    <div className="flex flex-col gap-8 bg-background">
      <PageHeader eyebrow="Threshold Lab" title="Lab Notes" />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section
          aria-labelledby="latest-notes"
          className="flex min-w-0 flex-col gap-4 lg:col-span-2"
        >
          <Suspense fallback={<LabNotesFeedSkeleton />}>
            <LabNotesContent />
          </Suspense>
        </section>

        <aside
          aria-label="Training context"
          className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20"
        >
          <Suspense fallback={<CurrentTrainingBlockSkeleton />}>
            <CurrentTrainingBlockContent />
          </Suspense>
          <Suspense fallback={<UpcomingRacesSkeleton />}>
            <UpcomingRacesContent />
          </Suspense>
          <BaseFitnessSummary />
        </aside>
      </div>
    </div>
  );
}
