import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthHeader } from "@/components/auth/auth-header";
import { MembershipCheckout } from "@/components/auth/membership-checkout";
import { checkAuthenticated } from "@/lib/auth";
import { getPreviewAuthState } from "@/lib/auth/preview.server";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = {
  title: "Complete Your Membership | Threshold Lab",
};

async function MembershipAccessGate() {
  await checkAuthenticated();

  const preview = await getPreviewAuthState();
  if (preview.enabled) {
    redirect("/lab/lab-notes");
  }

  const access = await fetchAuthQuery(api.auth.getCurrentLabAccess, {});
  if (access.hasAccess) {
    redirect("/lab/lab-notes");
  }

  return <MembershipCheckout />;
}

function MembershipCheckoutFallback() {
  return (
    <p aria-live="polite" className="text-muted-foreground text-sm">
      Checking membership…
    </p>
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
