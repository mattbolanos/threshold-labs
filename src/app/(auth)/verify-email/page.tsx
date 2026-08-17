import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthHeader } from "@/components/auth/auth-header";
import { VerificationEmailNotice } from "@/components/auth/verification-email-notice";

export const metadata: Metadata = {
  title: "Verify Your Email | Threshold Lab",
};

interface VerifyEmailPageProps {
  searchParams: Promise<{
    email?: string | string[];
    error?: string | string[];
  }>;
}

async function VerificationEmailContent({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const emailParam = Array.isArray(params.email)
    ? params.email[0]
    : params.email;
  const errorParam = Array.isArray(params.error)
    ? params.error[0]
    : params.error;

  return (
    <VerificationEmailNotice
      email={emailParam?.trim().toLowerCase() ?? ""}
      invalidLink={errorParam === "invalid_token"}
    />
  );
}

function VerificationEmailFallback() {
  return (
    <p aria-live="polite" className="text-center text-sm text-muted-foreground">
      Preparing email verification…
    </p>
  );
}

export default function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  return (
    <div className="relative z-10 w-full max-w-md px-4 sm:px-0">
      <AuthHeader
        description="Confirm your address to continue"
        title="Verify your email"
      />
      <Suspense fallback={<VerificationEmailFallback />}>
        <VerificationEmailContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
