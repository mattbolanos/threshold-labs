import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { WorkoutLibrary } from "@/components/workout-library/workout-library";
import { checkLabAccess } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  description:
    "Search every published workout by name, type, training block, week, or date range.",
  title: "Workout Library | Threshold Lab",
};

async function WorkoutLibraryPageContent() {
  await checkLabAccess();

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
        description="Search workouts by name, training block, type, week, or date range."
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
