import { IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";

export function PartnershipsStrip() {
  return (
    <section
      className="scroll-mt-24 border-y border-lime-300/10 bg-neutral-900/40"
      id="partnerships"
    >
      <div className="route-padding-x mx-auto flex max-w-7xl flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-lime-300 uppercase">
            Partnerships
          </p>
          <p className="mt-2 text-lg font-bold text-white">
            The partners behind the work.
          </p>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end">
          <Link
            className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950 px-5 text-sm font-black tracking-widest text-white transition-colors hover:border-lime-300"
            href="/partnerships#1st-phorm"
          >
            1ST PHORM
            <IconArrowUpRight aria-hidden className="size-4 text-lime-300" />
          </Link>
          <Link
            className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-neutral-950 px-5 text-sm font-black tracking-widest text-white transition-colors hover:border-lime-300"
            href="/partnerships#coros"
          >
            COROS
            <IconArrowUpRight aria-hidden className="size-4 text-lime-300" />
          </Link>
          <Link
            className="inline-flex min-h-14 items-center gap-2 px-2 text-sm font-bold text-lime-300 hover:text-lime-200"
            href="/partnerships"
          >
            View all
            <IconArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
