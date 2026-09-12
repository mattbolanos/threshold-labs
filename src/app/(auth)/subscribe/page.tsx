import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthHeader } from "@/components/auth/auth-header";
import { DiscountOfferCheckout } from "@/components/auth/discount-offer-checkout";
import { MembershipCheckout } from "@/components/auth/membership-checkout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCurrentLabAccess,
  getPendingDiscountOffer,
  getTrainingBlockCatalog,
  isAppAuthenticated,
} from "@/lib/auth";

export const metadata: Metadata = {
  title: "Choose Your Access | Threshold Lab",
};

interface SubscribePageProps {
  searchParams: Promise<{
    checkout?: string | string[];
    purchase?: string | string[];
    view?: string | string[];
  }>;
}

async function MembershipAccessGate({ searchParams }: SubscribePageProps) {
  const [{ checkout, purchase, view }, isAuthenticated, blocks] =
    await Promise.all([
      searchParams,
      isAppAuthenticated(),
      getTrainingBlockCatalog(),
    ]);
  const [access, discountOffer] = isAuthenticated
    ? await Promise.all([getCurrentLabAccess(), getPendingDiscountOffer()])
    : [null, null];
  const hasMembership = access?.source === "subscription";
  // Returning from a cancelled Stripe session, or explicitly asking for the
  // full menu, must not bounce the member straight back into checkout.
  const showAllOptions =
    checkout !== undefined || purchase !== undefined || view === "all";

  const offerAvailable =
    !discountOffer?.availableAt || discountOffer.availableAt <= Date.now();
  if (discountOffer && offerAvailable && !hasMembership && !showAllOptions) {
    return <DiscountOfferCheckout offer={discountOffer} />;
  }

  return (
    <>
      <AuthHeader
        description="Follow training as it happens with the monthly membership, or buy training blocks outright and keep them for good."
        title="Choose your access"
      />
      <MembershipCheckout
        blocks={blocks}
        discountOffer={discountOffer}
        hasMembership={hasMembership}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}

function MembershipCheckoutFallback() {
  return (
    <>
      <div className="mb-6 flex flex-col items-center gap-3">
        <Skeleton className="size-14 rounded-xl" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Skeleton className="min-h-96 w-full rounded-xl" />
        <Skeleton className="min-h-96 w-full rounded-xl" />
      </div>
    </>
  );
}

export default function SubscribePage({ searchParams }: SubscribePageProps) {
  return (
    <div className="route-padding-x route-padding-y relative z-10 mx-auto w-full max-w-6xl">
      <Suspense fallback={<MembershipCheckoutFallback />}>
        <MembershipAccessGate searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
