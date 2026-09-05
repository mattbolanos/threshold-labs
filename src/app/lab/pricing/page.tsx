import type { Metadata } from "next";
import { Suspense } from "react";
import { MembershipCheckout } from "@/components/auth/membership-checkout";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { PageHeader } from "@/components/page-header";
import {
  getCurrentLabAccess,
  getPendingDiscountOffer,
  getTrainingBlockCatalog,
} from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Compare monthly Inside the Lab access with one-time training block purchases.",
  title: "Pricing | Threshold Lab",
};

async function PricingPageContent() {
  const [access, blocks, discountOffer] = await Promise.all([
    getCurrentLabAccess(),
    getTrainingBlockCatalog(),
    getPendingDiscountOffer(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader title="Pricing" />

      <MembershipCheckout
        blocks={blocks}
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
