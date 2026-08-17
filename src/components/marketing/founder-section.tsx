import { IconArrowUpRight, IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import { coachingApplicationUrl } from "@/lib/marketing-content";

const highlights = [
  "2026 Elite 15 Doubles World Championship — 6th place",
  "2026 American Elite 15 Doubles — 1st place",
  "2026 American Elite 15 — 6th place",
  "56:28 Men’s Pro PR",
  "49:00 Men’s Pro Doubles PR",
  "6× HYROX World Championships Qualifier (1× Elite Doubles, 3× Pro, 2× Pro Doubles)",
] as const;

export function FounderSection() {
  return (
    <section
      className="route-padding-x mx-auto max-w-7xl py-10 sm:py-12"
      id="coach"
    >
      <div className="grid overflow-hidden rounded-3xl border border-lime-300/15 bg-neutral-900/65 lg:grid-cols-2">
        <div className="relative min-h-96 lg:min-h-full">
          <Image
            alt="Stephen Pelkofer competing as an Elite 15 HYROX athlete"
            className="object-cover object-center"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            src="/marketing/founder-elite-15.png"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent lg:bg-linear-to-r lg:from-transparent lg:to-neutral-900/30" />
        </div>
        <div className="p-7 sm:p-10 lg:p-14">
          <p className="text-xs font-bold tracking-widest text-lime-300 uppercase">
            Head coach + founder
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            Stephen Pelkofer
          </h2>
          <p className="mt-5 text-lg leading-8 text-neutral-400">
            I&apos;m a full-time HYROX coach, athlete, and community builder.
            The same principles and progressions that got me from a 1:07:06
            HYROX debut to Elite 15 status are what I use for Threshold Lab
            athletes and programs.
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <li
                className="flex items-start gap-2.5 text-sm leading-6 text-neutral-300"
                key={highlight}
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-lime-300/10 text-lime-300">
                  <IconCheck aria-hidden className="size-3" />
                </span>
                {highlight}
              </li>
            ))}
          </ul>
          <a
            className="mt-9 inline-flex items-center gap-2 rounded-full border border-lime-300/25 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-lime-300 hover:text-lime-300"
            href={coachingApplicationUrl}
            rel="noreferrer"
            target="_blank"
          >
            Apply for 1:1 coaching
            <IconArrowUpRight aria-hidden className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
