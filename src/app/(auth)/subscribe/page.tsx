import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthHeader } from "@/components/auth/auth-header";
import { MembershipCheckout } from "@/components/auth/membership-checkout";
import { Skeleton } from "@/components/ui/skeleton";
import { getPostAuthDestination } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Complete Your Membership | Threshold Lab",
};

async function MembershipAccessGate() {
  const destination = await getPostAuthDestination();
  if (destination === "/lab/lab-notes") {
    redirect(destination);
  }

  return <MembershipCheckout />;
}

function MembershipCheckoutFallback() {
  return (
    <Skeleton className="h-60.5 w-full rounded-xl border bg-card/85 p-7 shadow-xl shadow-foreground/5 backdrop-blur-sm" />
  );
}

export default function SubscribePage() {
  return (
    <div className="relative z-10 w-full max-w-md px-4 sm:px-0">
      <AuthHeader
        description="Review your membership, then continue to Stripe to pay securely."
        title="Complete your membership"
      />
      <Suspense fallback={<MembershipCheckoutFallback />}>
        <MembershipAccessGate />
      </Suspense>
    </div>
  );
}
