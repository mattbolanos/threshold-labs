import { AuthHeader } from "@/components/auth/auth-header";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative z-10 w-full max-w-md">
      <AuthHeader
        description="Sign in to access the training dashboard"
        title="Welcome back"
      />
      <LoginForm />
    </div>
  );
}
