import type { Metadata } from "next";
import { AuthHeader } from "@/components/auth/auth-header";
import { EmailOtpAuthForm } from "@/components/auth/email-otp-auth-form";

export const metadata: Metadata = {
  title: "Sign In | Threshold Lab",
};

export default function LoginPage() {
  return (
    <div className="relative z-10 w-full max-w-md">
      <AuthHeader title="Access Inside the Lab" />
      <EmailOtpAuthForm mode="login" />
    </div>
  );
}
