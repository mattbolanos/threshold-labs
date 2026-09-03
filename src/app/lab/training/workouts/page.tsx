import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { WorkoutLibrary } from "@/components/workout-library/workout-library";
import { checkTrainingAccess } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  description:
    "Search available workouts by name, type, training block, week, or date range.",
  title: "Workout Library | Threshold Lab",
};

async function WorkoutLibraryPageContent() {
  const access = await checkTrainingAccess();
  const description =
    access.source === "admin" || access.source === "preview"
      ? "Search every published workout by name, training block, type, week, or date range."
      : access.source === "training_archive"
        ? "Search archived workouts from September 1, 2025 through September 1, 2026."
        : "Search today and the previous 30 days by name, training block, type, week, or date range.";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={
          <Link
            className={cn(buttonVariants({ variant: "outline" }))}
            href="/lab/training"
          >
            <IconArrowLeft aria-hidden data-icon="inline-start" />
            Back to week view
          </Link>
        }
        description={description}
        eyebrow="Training"
        title="Workout library"
      />
      <WorkoutLibrary />
    </div>
  );
}

export default function WorkoutLibraryPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <WorkoutLibraryPageContent />
    </Suspense>
  );
}
