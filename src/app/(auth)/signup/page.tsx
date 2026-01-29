import { AuthHeader } from "@/components/auth/auth-header";
import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <div className="relative z-10 w-full max-w-md">
      <AuthHeader
        description="HYROX Community • Elite Performance"
        title="Join Threshold Lab"
      />
      <SignUpForm />
    </div>
  );
}
