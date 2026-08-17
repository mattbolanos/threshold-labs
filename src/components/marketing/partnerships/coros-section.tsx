import { IconArrowUpRight } from "@tabler/icons-react";
import { corosProducts } from "@/lib/partnership-content";
import { PartnerProductCard } from "./partner-product-card";

export function CorosSection() {
  return (
    <section
      className="scroll-mt-24 border-y border-white/10 bg-neutral-900/30 py-20 sm:py-28"
      id="coros"
    >
      <div className="route-padding-x mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="text-xs font-bold tracking-widest text-lime-300 uppercase">
              Training Technology
            </p>
            <h2 className="mt-5 text-5xl font-black tracking-tighter text-white sm:text-7xl">
              COROS
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-400">
              Clear training data, reliable tools, and hardware built to stay
              out of the way. These are the two pieces at the center of the
              setup.
            </p>
          </div>
          <div className="lg:text-right">
            <a
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-lime-300"
              href="https://coros.com/"
              rel="noreferrer"
              target="_blank"
            >
              Explore COROS
              <IconArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {corosProducts.map((product, index) => (
            <PartnerProductCard
              brand="COROS"
              index={index}
              key={product.title}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
