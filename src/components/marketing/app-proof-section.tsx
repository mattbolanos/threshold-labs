import Image from "next/image";
import { appMembershipUrl, testimonials } from "@/lib/marketing-content";
import { MarketingContainer } from "./marketing-container";

export function AppProofSection() {
  const josh = testimonials.find((testimonial) => testimonial.name === "Josh");
  if (!josh) return null;
  return (
    <section className="scroll-mt-24" id="app-results">
      <MarketingContainer className="route-padding-x pb-16">
        <div className="grid overflow-hidden rounded-3xl border border-primary/15 bg-neutral-900/50 md:grid-cols-3">
          <div className="relative min-h-72">
            <Image
              alt="Josh, Threshold Lab run program member"
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              src={josh.image}
            />
          </div>
          <div className="p-6 sm:p-10 md:col-span-2">
            <p className="text-xs font-bold tracking-widest text-primary uppercase">
              From the app community · 16-week run program
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
              20:12 → 17:56
              <span className="ml-3 text-base font-medium text-neutral-400">
                5K
              </span>
            </h2>
            <blockquote className="mt-5 text-lg leading-8 text-neutral-300">
              “The programming is purposeful, progressive, and well structured.”
            </blockquote>
            <p className="mt-3 text-sm text-neutral-400">
              Josh · Threshold Lab App member
            </p>
            <a
              className="mt-6 inline-block text-sm font-bold text-primary underline-offset-4 hover:underline"
              href={appMembershipUrl}
            >
              Find your training in the app ↗
            </a>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
