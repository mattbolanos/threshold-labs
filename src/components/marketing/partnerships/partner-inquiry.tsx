import { IconArrowUpRight, IconBrandInstagram } from "@tabler/icons-react";

export function PartnerInquiry() {
  return (
    <section className="scroll-mt-24 py-20 sm:py-28" id="sponsor-inquiry">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 px-6 py-12 sm:px-10 lg:flex lg:items-end lg:justify-between lg:gap-12 lg:px-14">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            For Brands
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-5xl">
            Want your brand featured here?
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-neutral-400">
            I work with performance-focused brands that fit the reality of
            HYROX, hybrid, and endurance training.
          </p>
        </div>
        <a
          className="mt-8 inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-neutral-950 transition-colors hover:bg-primary lg:mt-0"
          href="https://www.instagram.com/stephen.pelkofer/"
          rel="noreferrer"
          target="_blank"
        >
          <IconBrandInstagram aria-hidden className="size-4" />
          Start a conversation
          <IconArrowUpRight aria-hidden className="size-4" />
        </a>
      </div>
    </section>
  );
}
