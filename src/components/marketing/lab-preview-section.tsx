import {
  IconArrowUpRight,
  IconChartLine,
  IconLock,
  IconNotebook,
} from "@tabler/icons-react";
import { insideLabEarlyAccessUrl } from "@/lib/marketing-content";

export function LabPreviewSection() {
  return (
    <section
      className="scroll-mt-24 border-y border-lime-300/10 bg-neutral-900/45"
      id="inside-the-lab"
    >
      <div
        className="mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center"
        id="lab-preview"
      >
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold tracking-widest text-lime-300 uppercase">
              Inside the Lab
            </p>
            <span className="rounded-full bg-lime-300 px-2.5 py-1 text-xs font-black text-neutral-950 uppercase">
              Beta
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            See the work behind the result.
          </h2>
          <p className="mt-5 text-lg leading-8 text-neutral-400">
            Lab Notes explain the decisions. The training view shows how those
            decisions become a real week of work.
          </p>
          <a
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime-300 px-5 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-lime-200"
            href={insideLabEarlyAccessUrl}
            rel="noreferrer"
            target="_blank"
          >
            Apply for early access
            <IconArrowUpRight aria-hidden className="size-4" />
          </a>
        </div>

        <div className="grid gap-3 rounded-3xl border border-lime-300/15 bg-neutral-950 p-3 shadow-2xl sm:grid-cols-2">
          <article className="rounded-2xl bg-neutral-900 p-5 sm:row-span-2">
            <IconNotebook aria-hidden className="size-6 text-lime-300" />
            <p className="mt-10 text-xs font-bold tracking-widest text-neutral-500 uppercase">
              Latest Lab Note
            </p>
            <h3 className="mt-3 text-xl font-bold text-white">
              Training decisions, without the highlight reel.
            </h3>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              What changed, why it changed, and what I am watching next.
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-neutral-500">
              <IconLock aria-hidden className="size-4" />
              Member access
            </div>
          </article>

          <article className="rounded-2xl bg-neutral-900 p-5">
            <div className="flex items-center justify-between">
              <IconChartLine aria-hidden className="size-6 text-lime-300" />
              <span className="text-xs font-semibold text-neutral-500">
                12 weeks
              </span>
            </div>
            <div
              aria-hidden="true"
              className="mt-7 flex h-20 items-end gap-1.5"
            >
              {[35, 52, 44, 67, 58, 76, 63, 84, 72, 91, 80, 96].map(
                (height) => (
                  <span
                    className="flex-1 rounded-t-sm bg-lime-300/70"
                    key={height}
                    style={{ height: `${height}%` }}
                  />
                ),
              )}
            </div>
            <p className="mt-3 text-sm font-bold text-white">Training trends</p>
          </article>

          <article className="rounded-2xl bg-lime-300 p-5 text-neutral-950">
            <p className="text-xs font-black tracking-widest uppercase">
              Current focus
            </p>
            <p className="mt-5 text-xl font-black tracking-tight">
              The full block, session by session.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
