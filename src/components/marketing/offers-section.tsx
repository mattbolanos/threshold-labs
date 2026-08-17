import { IconArrowUpRight, IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import { offers } from "@/lib/marketing-content";
import { MarketingContainer } from "./marketing-container";

export function OffersSection() {
  return (
    <section className="scroll-mt-24" id="work-with-me">
      <MarketingContainer className="route-padding-x pt-16 pb-10 sm:pt-20 sm:pb-12">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            How you can work with the Lab
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
            Choose the level of support you need.
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {offers.map((offer) => {
            const isExternal = offer.cta.href.startsWith("http");
            const ctaClass =
              "mt-auto inline-flex items-center justify-between rounded-xl border border-primary/20 bg-neutral-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:border-primary hover:text-primary";
            const ctaContent = (
              <>
                {offer.cta.label}
                <IconArrowUpRight aria-hidden className="size-4" />
              </>
            );

            return (
              <article
                className="flex min-h-96 flex-col rounded-3xl border border-primary/15 bg-neutral-900/75 p-6 shadow-xl"
                key={offer.title}
              >
                <p className="text-xs font-bold tracking-widest text-primary uppercase">
                  {offer.eyebrow}
                </p>
                <h3 className="mt-5 text-2xl font-black tracking-tight text-white">
                  {offer.title}
                </h3>
                <p className="mt-3 leading-7 text-neutral-400">
                  {offer.description}
                </p>
                <ul className="my-7 space-y-3">
                  {offer.details.map((detail) => (
                    <li
                      className="flex items-center gap-3 text-sm text-neutral-200"
                      key={detail}
                    >
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <IconCheck aria-hidden className="size-3.5" />
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>
                {isExternal ? (
                  <a
                    className={ctaClass}
                    href={offer.cta.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {ctaContent}
                  </a>
                ) : (
                  <Link className={ctaClass} href={offer.cta.href}>
                    {ctaContent}
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </MarketingContainer>
    </section>
  );
}
