import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthHeader } from "@/components/auth/auth-header";
import { MembershipCheckout } from "@/components/auth/membership-checkout";
import { Skeleton } from "@/components/ui/skeleton";
import { getPostAuthDestination, getTrainingBlockCatalog } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Choose Your Access | Threshold Lab",
};

async function MembershipAccessGate() {
  const destination = await getPostAuthDestination();
  if (destination === "/lab/lab-notes") {
    redirect(destination);
  }

  const blocks = await getTrainingBlockCatalog();

  return <MembershipCheckout blocks={blocks} />;
}

function MembershipCheckoutFallback() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Skeleton className="min-h-96 w-full rounded-xl" />
      <Skeleton className="min-h-96 w-full rounded-xl" />
    </div>
  );
}

export default function SubscribePage() {
  return (
    <div className="relative z-10 w-full max-w-4xl px-4 sm:px-6">
      <AuthHeader
        description="Follow training as it happens with the monthly membership, or buy completed training blocks outright and keep them for good."
        title="Choose your access"
      />
      <Suspense fallback={<MembershipCheckoutFallback />}>
        <MembershipAccessGate />
      </Suspense>
    </div>
  );
}
