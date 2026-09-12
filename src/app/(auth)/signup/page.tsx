import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthHeader } from "@/components/auth/auth-header";
import { EmailOtpAuthForm } from "@/components/auth/email-otp-auth-form";

export const metadata: Metadata = {
  title: "Sign Up | Threshold Lab",
};

export default function SignUpPage() {
  return (
    <div className="relative z-10 w-full max-w-md">
      <AuthHeader
        description="Sign up with Google, or register with your email"
        title="Create an Account"
      />
      <Suspense
        fallback={
          <p className="text-center text-muted-foreground">Loading signup…</p>
        }
      >
        <EmailOtpAuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
