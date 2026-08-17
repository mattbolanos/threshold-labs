import { IconArrowUpRight } from "@tabler/icons-react";
import Image from "next/image";
import type {
  FeaturedPartnerProduct,
  PartnerProduct,
} from "@/lib/partnership-content";

type PartnerProductCardProps = {
  affiliateDisclosure?: string;
  brand: string;
  index: number;
  product: PartnerProduct | FeaturedPartnerProduct;
};

function hasImage(
  product: PartnerProduct | FeaturedPartnerProduct,
): product is FeaturedPartnerProduct {
  return "image" in product;
}

export function PartnerProductCard({
  affiliateDisclosure,
  brand,
  index,
  product,
}: PartnerProductCardProps) {
  const featured = hasImage(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 transition-colors hover:border-primary/40">
      {featured ? (
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          <Image
            alt={product.imageAlt}
            className="object-contain p-7 transition-transform duration-500 group-hover:scale-105 sm:p-10"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            src={product.image}
          />
          <span className="absolute top-4 left-4 rounded-full bg-neutral-950/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            {product.stat}
          </span>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold tracking-widest text-primary uppercase">
            {brand}
          </p>
          <span className="font-mono text-xs text-neutral-600">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <h3 className="mt-4 text-2xl font-black tracking-tight text-white">
          {product.title}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-7 text-neutral-400">
          {product.description}
        </p>
        <div className="mt-6 flex flex-col items-start gap-2">
          <a
            className="inline-flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-primary"
            href={product.href}
            rel="noreferrer"
            target="_blank"
          >
            View {product.title}
            <IconArrowUpRight aria-hidden className="size-4" />
          </a>
          {affiliateDisclosure ? (
            <p className="text-xs leading-5 text-neutral-400">
              {affiliateDisclosure}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
