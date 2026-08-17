import type { Metadata } from "next";
import { AuthHeader } from "@/components/auth/auth-header";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In | Threshold Lab",
};

export default function LoginPage() {
  return (
    <div className="relative z-10 w-full max-w-md">
      <AuthHeader
        description="Use a one-time code to continue"
        title="Access Inside the Lab"
      />
      <LoginForm />
    </div>
  );
}
