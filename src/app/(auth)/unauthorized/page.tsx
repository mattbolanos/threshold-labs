import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MembershipRequired } from "@/components/auth/membership-required";
import { checkAuthenticated, getPendingDiscountOffer } from "@/lib/auth";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = {
  title: "Membership Required | Threshold Lab",
};

async function MembershipAccessGate() {
  await checkAuthenticated();

  const [access, discountOffer] = await Promise.all([
    fetchAuthQuery(api.auth.getCurrentLabAccess, {}),
    getPendingDiscountOffer(),
  ]);
  if (access.hasAccess) {
    redirect("/lab/lab-notes");
  }
  // An emailed offer is waiting: the subscribe page opens checkout directly.
  if (discountOffer) {
    redirect("/subscribe");
  }

  return <MembershipRequired hasBillingAccount={access.hasBillingAccount} />;
}

function MembershipAccessFallback() {
  return (
    <p aria-live="polite" className="text-sm text-muted-foreground">
      Checking membership…
    </p>
  );
}

export default function UnauthorizedPage() {
  return (
    <div className="relative z-10 w-full max-w-md px-4 sm:px-0">
      <Suspense fallback={<MembershipAccessFallback />}>
        <MembershipAccessGate />
      </Suspense>
    </div>
  );
}
