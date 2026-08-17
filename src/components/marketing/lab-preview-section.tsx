import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import { LAB_PREVIEW_WEEK } from "@/components/marketing/lab-preview-data";
import { LabWeekPreview } from "@/components/marketing/lab-week-preview";

export function LabPreviewSection() {
  return (
    <section
      className="scroll-mt-24 border-y border-lime-300/10 bg-neutral-900/45"
      id="inside-the-lab"
    >
      <div
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24"
        id="lab-preview"
      >
        <div className="grid gap-8 lg:grid-cols-3 lg:items-end lg:gap-12">
          <div className="max-w-3xl lg:col-span-2">
            <p className="text-xs font-bold tracking-widest text-lime-300 uppercase">
              Inside the Lab
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              See how the work gets built.
            </h2>
            <p className="mt-5 text-lg leading-8 text-neutral-400">
              Open the highlighted sessions to see the exact plan, fueling,
              training load, and notes behind the work. The complete log and
              every weekly decision are inside the Lab.
            </p>
          </div>

          <div className="flex w-full flex-col items-stretch lg:w-auto lg:items-end lg:justify-self-end">
            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime-300 px-5 py-3 text-sm font-bold text-neutral-950 transition-colors outline-none hover:bg-lime-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300 active:scale-96 lg:w-fit"
              href="/signup"
            >
              Create your account
              <IconArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        </div>

        <LabWeekPreview previewWeek={LAB_PREVIEW_WEEK} />
      </div>
    </section>
  );
}
