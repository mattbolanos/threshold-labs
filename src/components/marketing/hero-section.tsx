import { IconArrowDown, IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";
import { coachingApplicationUrl } from "@/lib/marketing-content";

const stats = [
  { label: "Athletes coached", value: "150+" },
  { label: "Men's Pro PR", value: "56:28" },
  { label: "Pro Doubles PR", value: "49:00" },
  { label: "Mixed Doubles PR", value: "52:54" },
] as const;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 sm:pt-24">
      <div className="marketing-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="marketing-glow pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="mb-5 text-xs font-bold tracking-widest text-lime-300 uppercase">
              HYROX Training &amp; Community
            </p>
            <h1 className="max-w-2xl text-5xl leading-none font-black tracking-tighter text-white sm:text-6xl lg:text-7xl">
              More than race prep. A place to keep building.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-400">
              Threshold Lab is a year-round training system and HYROX community
              for competitors of all levels. We have a place and plan for
              everyone.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-5 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-lime-200"
                href="#work-with-me"
              >
                Find your place in the Lab
                <IconArrowDown aria-hidden className="size-4" />
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-full border border-lime-300/25 bg-neutral-900/70 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-lime-300"
                href={coachingApplicationUrl}
                rel="noreferrer"
                target="_blank"
              >
                Apply for 1:1
                <IconArrowUpRight aria-hidden className="size-4" />
              </a>
            </div>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-3xl border border-lime-300/20 bg-neutral-900 shadow-2xl">
            <Image
              alt="Threshold Lab community running together in the rain"
              className="object-cover object-center"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              src="/marketing/community-run.jpg"
              style={{ objectPosition: "center 70%" }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/60 to-transparent p-6 pt-20">
              <p className="text-xs font-bold tracking-widest text-lime-300 uppercase">
                One system. Every season.
              </p>
              <p className="mt-1 text-lg font-bold text-white">
                Train together. Keep building.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 overflow-hidden rounded-2xl border border-lime-300/15 bg-neutral-950/80 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              className="border-r border-b border-lime-300/10 p-4 last:border-r-0 sm:border-b-0 sm:p-5"
              key={stat.label}
            >
              <p className="text-2xl font-black tracking-tight text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-neutral-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
