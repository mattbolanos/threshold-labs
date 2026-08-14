import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MembershipCheckout } from "@/components/auth/membership-checkout";
import { checkAuth } from "@/lib/auth";
import { getPreviewAuthState } from "@/lib/auth/preview.server";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = {
  title: "Complete Membership | Threshold Lab",
};

async function MembershipAccessGate() {
  await checkAuth();

  const preview = await getPreviewAuthState();
  if (preview.enabled) {
    redirect("/lab/lab-notes");
  }

  const isDevelopment = process.env.NODE_ENV === "development";

  if (!isDevelopment) {
    const access = await fetchAuthQuery(api.auth.getCurrentLabAccess, {});
    if (access.hasAccess) {
      redirect("/lab/lab-notes");
    }
  }

  return <MembershipCheckout allowDevelopmentBypass={isDevelopment} />;
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
    <div className="relative z-10 flex min-h-48 w-full max-w-md items-center justify-center">
      <Suspense fallback={<MembershipCheckoutFallback />}>
        <MembershipAccessGate />
      </Suspense>
    </div>
  );
}
