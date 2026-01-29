"use client";

import { IconBrandGoogleFilled, IconLoader2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    await authClient.signIn.email(
      {
        callbackURL: "/",
        email,
        password,
      },
      {
        onError: (ctx) => {
          setError(ctx.error.message || "Invalid email or password");
          setIsLoading(false);
        },
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    );
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);

    await authClient.signIn.social({
      callbackURL: "/",
      errorCallbackURL: "/login?error=google",
      provider: "google",
    });
  };

  return (
    <div className="bg-card/80 rounded-2xl border p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            autoComplete="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="athlete@example.com"
            required
            type="email"
            value={email}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            autoComplete="current-password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            type="password"
            value={password}
          />
        </div>

        {error && (
          <div
            aria-live="polite"
            className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <Button
          className="w-full text-black"
          disabled={isLoading || isGoogleLoading}
          size="lg"
          type="submit"
        >
          {isLoading ? (
            <>
              <IconLoader2 className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card text-muted-foreground px-3">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        className="w-full"
        disabled={isLoading || isGoogleLoading}
        onClick={handleGoogleSignIn}
        size="lg"
        variant="outline"
      >
        {isGoogleLoading ? (
          <>
            <IconLoader2 className="animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <IconBrandGoogleFilled className="size-5" />
            <span>Google</span>
          </>
        )}
      </Button>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <a
          className="text-foreground font-medium underline-offset-4 transition-colors hover:underline"
          href="/signup"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}
