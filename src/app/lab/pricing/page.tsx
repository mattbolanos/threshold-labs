import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MembershipCheckout } from "@/components/auth/membership-checkout";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { PageHeader } from "@/components/page-header";
import {
  getCurrentLabAccess,
  getPendingDiscountOffer,
  getTrainingBlockBundlePrice,
  getTrainingBlockCatalog,
} from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Compare monthly Inside the Lab access with one-time training block purchases.",
  title: "Pricing | Threshold Lab",
};

async function PricingPageContent() {
  const [access, blocks, discountOffer, bundlePrice] = await Promise.all([
    getCurrentLabAccess(),
    getTrainingBlockCatalog(),
    getPendingDiscountOffer(),
    getTrainingBlockBundlePrice(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader title="Inside the Lab access" />
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h2 className="text-xl font-bold">
          Follow the training as it happens.
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Monthly membership includes training from 30 days before signup onward
          and every Lab Note. Historical blocks are optional one-time purchases.
        </p>
        <Link
          className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
          href="/inside-the-lab"
        >
          See what’s inside the membership ↗
        </Link>
      </div>

      <MembershipCheckout
        blocks={blocks}
        bundleAmountCents={bundlePrice.amountCents}
        discountOffer={discountOffer}
        hasMembership={access.source === "subscription"}
        surface="pricing"
      />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <PricingPageContent />
    </Suspense>
  );
}
