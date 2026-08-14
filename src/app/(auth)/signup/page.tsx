import type { Metadata } from "next";
import { AuthHeader } from "@/components/auth/auth-header";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign Up | Threshold Lab",
};

export default function SignUpPage() {
  return (
    <div className="relative z-10 w-full max-w-md">
      <AuthHeader
        description="Create your account"
        title="Access Inside the Lab"
      />
      <SignUpForm />
    </div>
  );
}
