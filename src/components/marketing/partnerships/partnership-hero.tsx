import { IconArrowDown } from "@tabler/icons-react";

export function PartnershipHero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="marketing-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="marketing-glow pointer-events-none absolute inset-0" />

      <div className="route-padding-x relative mx-auto max-w-7xl">
        <p className="text-xs font-bold tracking-widest text-primary uppercase">
          Threshold Lab Partners
        </p>
        <h1 className="mt-5 max-w-4xl text-5xl leading-none font-black tracking-tighter text-white sm:text-6xl lg:text-8xl">
          The partners supporting the work
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-400 sm:text-xl">
          Partners and products I trust through year-round training, race prep,
          and recovery.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <a
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-primary"
            href="#1st-phorm"
          >
            Explore the partners
            <IconArrowDown aria-hidden className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
