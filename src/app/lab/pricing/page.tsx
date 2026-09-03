import type { Metadata } from "next";
import { Suspense } from "react";
import { MembershipCheckout } from "@/components/auth/membership-checkout";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { PageHeader } from "@/components/page-header";
import { getCurrentLabAccess } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Compare Inside the Lab membership and one-time training archive access.",
  title: "Pricing | Threshold Lab",
};

async function PricingPageContent() {
  const access = await getCurrentLabAccess();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        description="Choose full monthly membership or a one-time pass to the 2025–2026 training archive. The products are separate, so you can own either one or both."
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
