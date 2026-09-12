import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthHeader } from "@/components/auth/auth-header";
import { EmailOtpAuthForm } from "@/components/auth/email-otp-auth-form";

export const metadata: Metadata = {
  title: "Sign In | Threshold Lab",
};

export default function LoginPage() {
  return (
    <div className="relative z-10 w-full max-w-md">
      <AuthHeader title="Access Inside the Lab" />
      <Suspense
        fallback={
          <p className="text-center text-muted-foreground">Loading sign in…</p>
        }
      >
        <EmailOtpAuthForm mode="login" />
      </Suspense>
    </div>
  );
}
