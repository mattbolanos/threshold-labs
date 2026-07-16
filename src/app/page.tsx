import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import {
  LabNotesFeed,
  LabNotesFeedSkeleton,
} from "@/components/posts/lab-notes-feed";
import {
  PlannedRaces,
  PlannedRacesSkeleton,
} from "@/components/races/planned-races";
import { Separator } from "@/components/ui/separator";
import { getTodayDate } from "@/lib/race-dates";
import { api } from "../../convex/_generated/api";

export const metadata: Metadata = {
  description:
    "Training decisions, observations, and experiments from Threshold Lab.",
  title: "Lab Notes | Threshold Lab",
};

async function PlannedRacesContent() {
  await connection();
  const races = await fetchQuery(api.races.getPlannedRaces, {
    fromDate: getTodayDate(),
  });

  return <PlannedRaces races={races} />;
}

async function LabNotesContent() {
  await connection();
  const posts = await fetchQuery(api.posts.getPublishedPosts);

  return <LabNotesFeed posts={posts} />;
}

export default function LabNotesPage() {
  return (
    <div className="flex flex-col gap-8 bg-background md:gap-10">
      <PageHeader eyebrow="Threshold Lab" title="Lab Notes" />
      <Suspense fallback={<PlannedRacesSkeleton />}>
        <PlannedRacesContent />
      </Suspense>
      <div>
        <Separator className="lg:hidden" />
      </div>
      <Suspense fallback={<LabNotesFeedSkeleton />}>
        <LabNotesContent />
      </Suspense>
    </div>
  );
}
