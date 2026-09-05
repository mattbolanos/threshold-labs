import type { Metadata } from "next";
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
      <EmailOtpAuthForm mode="signup" />
    </div>
  );
}
