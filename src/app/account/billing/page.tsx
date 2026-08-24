import type { Metadata } from "next";
import { Suspense } from "react";
import { MembershipCard } from "@/components/billing/membership-card";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { PageHeader } from "@/components/page-header";
import { getCurrentLabAccess, getCurrentStripeMembership } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Manage your Threshold Lab membership, payment method, invoices, and cancellation.",
  title: "Membership & Billing | Threshold Lab",
};

async function MembershipPageContent() {
  const [access, liveSubscription] = await Promise.all([
    getCurrentLabAccess(),
    getCurrentStripeMembership(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        description="Update your payment method, view invoices, or cancel your subscription securely through Stripe."
        eyebrow="Account"
        title="Membership & billing"
      />
      <MembershipCard
        accessSource={access.source}
        hasBillingAccount={access.hasBillingAccount}
        subscription={liveSubscription ?? access.subscription}
      />
    </div>
  );
}

export default function MembershipPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <MembershipPageContent />
    </Suspense>
  );
}
