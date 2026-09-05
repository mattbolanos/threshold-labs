import { IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";
import { MarketingContainer } from "@/components/marketing/marketing-container";
import { firstPhormProducts, firstPhormUrl } from "@/lib/partnership-content";
import { PartnerProductCard } from "./partner-product-card";

export function FirstPhormSection() {
  return (
    <section
      className="scroll-mt-24 border-t border-white/10 py-20 sm:py-28"
      id="1st-phorm"
    >
      <MarketingContainer className="route-padding-x">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="text-xs font-bold tracking-widest text-primary uppercase">
              Nutrition + Recovery
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-tighter text-white sm:text-6xl">
              1st Phorm
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-400">
              My primary supplement partner and the core products I use to
              support session quality, refueling, and recovery across demanding
              training blocks.
            </p>
          </div>
          <div className="flex flex-col items-start lg:items-end lg:text-right">
            <a
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary hover:text-neutral-950"
              href={firstPhormUrl}
              rel="noreferrer"
              target="_blank"
            >
              Shop 1st Phorm with my link
              <IconArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <div className="relative min-h-96 overflow-hidden rounded-3xl border border-primary/20 lg:row-span-2">
            <Image
              alt="Stephen Pelkofer using 1st Phorm Ultra-Formance"
              className="object-cover object-center"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              src="/marketing/partners/1st-phorm-ultraformance.jpg"
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/70 to-transparent p-7 pt-24">
              <p className="text-xs font-bold tracking-widest text-primary uppercase">
                Primary partner
              </p>
              <p className="mt-2 text-xl font-black text-white">
                Fuel the session. Recover for the next one.
              </p>
            </div>
          </div>
          {firstPhormProducts.map((product, index) => (
            <PartnerProductCard
              brand="1st Phorm"
              index={index}
              key={product.title}
              product={product}
            />
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
