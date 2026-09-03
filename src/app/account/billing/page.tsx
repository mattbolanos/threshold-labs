import type { UrlObject } from "node:url";
import { IconArrowRight } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MembershipCard } from "@/components/billing/membership-card";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentLabAccess, getCurrentStripeMembership } from "@/lib/auth";
import type { MembershipSubscription } from "@/lib/billing";

export const metadata: Metadata = {
  description:
    "Review your Threshold Lab access and manage subscription billing securely through Stripe.",
  title: "Billing | Threshold Lab",
};

async function MembershipPageContent() {
  const [access, liveSubscription] = await Promise.all([
    getCurrentLabAccess(),
    getCurrentStripeMembership(),
  ]);
  const plansHref: UrlObject = { pathname: "/lab/pricing" };
  const isBillingPreview = access.source === "preview";
  const previewSubscription: MembershipSubscription = {
    accessStart: "2026-07-05",
    billing: {
      amount: 5_000,
      currency: "usd",
      interval: "month",
      intervalCount: 1,
    },
    cancelAt: null,
    cancelAtPeriodEnd: false,
    periodEnd: Date.UTC(2026, 9, 3),
    status: "active",
  };
  const subscription = liveSubscription
    ? {
        ...liveSubscription,
        accessStart: access.subscription?.accessStart ?? null,
        pastAccessWindows: access.subscription?.pastAccessWindows ?? null,
      }
    : (access.subscription ?? (isBillingPreview ? previewSubscription : null));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <PageHeader
        actions={
          <Link
            className={buttonVariants({
              className:
                "min-h-11 w-full motion-safe:transition-transform motion-safe:active:scale-96 sm:w-auto",
              size: "lg",
              variant: "outline",
            })}
            href={plansHref}
          >
            <span>View plans</span>
            <IconArrowRight aria-hidden data-icon="inline-end" stroke={2} />
          </Link>
        }
        description="Review your current plan, upcoming renewal, and cancellation options."
        eyebrow="Account"
        title="Billing"
      />
      <MembershipCard
        accessSource={access.source}
        hasBillingAccount={access.hasBillingAccount || isBillingPreview}
        isBillingPreview={isBillingPreview}
        plansHref={plansHref}
        subscription={subscription}
        trainingArchive={access.trainingArchive}
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
