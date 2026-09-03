import type { Metadata } from "next";
import { Suspense } from "react";
import { MembershipCheckout } from "@/components/auth/membership-checkout";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { PageHeader } from "@/components/page-header";
import { getCurrentLabAccess } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Compare monthly Inside the Lab access with complete history plus membership.",
  title: "Pricing | Threshold Lab",
};

async function PricingPageContent() {
  const access = await getCurrentLabAccess();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        description="Choose $70 monthly access starting 30 days before signup, or pay $400 one time for complete history. Both options include every Lab Note, past and future, with the $70 monthly membership."
        eyebrow="Plans"
        title="Choose your access"
      />

      <MembershipCheckout
        hasMembership={access.source === "subscription"}
        hasTrainingArchive={access.trainingArchive !== null}
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
