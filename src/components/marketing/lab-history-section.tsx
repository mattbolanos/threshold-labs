import { IconArrowUpRight, IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import { Suspense } from "react";
import { trainingBlockPass } from "@/lib/billing";
import { BundlePriceDetail } from "./bundle-price-detail";
import { MarketingContainer } from "./marketing-container";

export function LabHistorySection() {
  return (
    <section className="scroll-mt-24" id="historical-access">
      <MarketingContainer className="route-padding-x pt-12 sm:pt-16">
        <div className="grid gap-8 rounded-3xl border border-primary/30 bg-neutral-900/60 p-6 sm:p-9 lg:grid-cols-3 lg:items-center">
          <div className="lg:col-span-2">
            <p className="text-xs font-bold tracking-widest text-primary uppercase">
              Prefer a one-time purchase?
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Buy the training history. Keep it for good.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-400">
              Study the blocks behind the results at your own pace. Get every
              currently available training block in one purchase, with no
              monthly subscription required.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "All current blocks, completed and in progress",
                "Workout library and performance charts for those dates",
                "Every Lab Note, past and future",
              ].map((feature) => (
                <li
                  className="flex gap-2 text-sm text-neutral-300"
                  key={feature}
                >
                  <IconCheck
                    aria-hidden
                    className="size-4 shrink-0 text-primary"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-neutral-950 p-6">
            <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
              The complete current collection
            </p>
            <p className="mt-4 text-3xl font-black tracking-tight text-white">
              <Suspense fallback="Loading current bundle price…">
                <BundlePriceDetail />
              </Suspense>
            </p>
            <p className="mt-3 text-sm text-neutral-400">
              One payment. Yours to keep.
            </p>
            <Link
              className="mt-6 flex items-center justify-between gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-neutral-950 hover:brightness-110"
              href="/subscribe?view=all"
            >
              View bundle & purchase options
              <IconArrowUpRight aria-hidden className="size-4 shrink-0" />
            </Link>
            <p className="mt-4 text-xs leading-5 text-neutral-400">
              Future blocks are sold separately or included with an active
              membership. Individual blocks are also available for{" "}
              {trainingBlockPass.priceLabel}.
            </p>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
