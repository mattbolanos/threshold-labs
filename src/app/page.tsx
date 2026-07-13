import type { Metadata } from "next";
import { LabNotesFeed } from "@/components/posts/lab-notes-feed";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  description:
    "Training decisions, observations, and experiments from Threshold Lab.",
  title: "Lab Notes | Threshold Lab",
};

export default function LabNotesPage() {
  return (
    <div className="flex flex-col gap-8 bg-background md:gap-10">
      <header className="flex max-w-2xl flex-col gap-3">
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          Threshold Lab
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Lab Notes
        </h1>
        <p className="text-muted-foreground max-w-xl text-base leading-relaxed">
          Training decisions, observations, and experiments from the work in
          progress.
        </p>
      </header>
      <div>
        <Separator className="lg:hidden" />
      </div>
      <LabNotesFeed />
    </div>
  );
}
