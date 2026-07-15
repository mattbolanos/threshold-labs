import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { LabNotesFeed } from "@/components/posts/lab-notes-feed";
import { PlannedRaces } from "@/components/races/planned-races";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  description:
    "Training decisions, observations, and experiments from Threshold Lab.",
  title: "Lab Notes | Threshold Lab",
};

export default function LabNotesPage() {
  return (
    <div className="flex flex-col gap-8 bg-background md:gap-10">
      <PageHeader eyebrow="Threshold Lab" title="Lab Notes" />
      <PlannedRaces />
      <div>
        <Separator className="lg:hidden" />
      </div>
      <LabNotesFeed />
    </div>
  );
}
