import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MembershipRequired } from "@/components/auth/membership-required";
import { checkAuthenticated } from "@/lib/auth";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = {
  title: "Membership Required | Threshold Lab",
};

async function MembershipAccessGate() {
  await checkAuthenticated();

  const access = await fetchAuthQuery(api.auth.getCurrentLabAccess, {});
  if (access.hasAccess) {
    redirect("/lab/lab-notes");
  }

  return <MembershipRequired />;
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
