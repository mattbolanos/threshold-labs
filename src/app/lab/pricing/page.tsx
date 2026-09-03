import type { Metadata } from "next";
import { Suspense } from "react";
import { MembershipCheckout } from "@/components/auth/membership-checkout";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { PageHeader } from "@/components/page-header";
import { getCurrentLabAccess, getTrainingBlockCatalog } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Compare monthly Inside the Lab access with one-time training block purchases.",
  title: "Pricing | Threshold Lab",
};

async function PricingPageContent() {
  const [access, blocks] = await Promise.all([
    getCurrentLabAccess(),
    getTrainingBlockCatalog(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        description="Join for $70 a month to follow training as it happens, or buy completed training blocks outright: $100 each, or $400 for all of them."
        eyebrow="Plans"
        title="Choose your access"
      />

      <MembershipCheckout
        blocks={blocks}
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
