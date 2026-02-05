"use client";

import { IconBrandGoogleFilled, IconLoader2 } from "@tabler/icons-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startPending] = useTransition();
  const [googlePending, startGooglePending] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startPending(async () => {
      await authClient.signUp.email(
        {
          callbackURL: "/",
          email,
          name,
          password,
        },
        {
          onError: (ctx) => {
            const isNotInvited = ctx.error.status === 422;

            if (isNotInvited) {
              window.location.href = `/unauthorized?email=${encodeURIComponent(email)}`;
              return;
            }

            setError(ctx.error.message || "Failed to create account");
          },
          onSuccess: () => {
            // Hard navigation to ensure fresh cookie read by server
            window.location.href = "/";
          },
        },
      );
    });
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    startGooglePending(async () => {
      await authClient.signIn.social({
        callbackURL: "/",
        errorCallbackURL: `${window.location.origin}/unauthorized`,
        newUserCallbackURL: "/",
        provider: "google",
      });
    });
  };

  return (
    <>
      {/* Invite-only notice */}
      <div className="border-primary/20 bg-primary/5 mb-4 flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm">
        <div className="bg-primary/20 flex size-5 items-center justify-center rounded">
          <div className="bg-primary size-1.5 rounded-full" />
        </div>
        <span className="font-medium">Invite Only</span>
        <span className="text-muted-foreground text-xs">
          Coach invitation required
        </span>
      </div>

      {/* Form Card */}
      <div className="bg-card/85 rounded-xl border p-7 shadow-xl shadow-black/[0.03] backdrop-blur-sm dark:shadow-black/20">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              autoComplete="name"
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              type="text"
              value={name}
            />
          </div>

          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              autoComplete="new-password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              type="password"
              value={password}
            />
            <p className="text-muted-foreground text-xs">
              Must be at least 8 characters
            </p>
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
            className="w-full font-semibold tracking-wide"
            disabled={pending}
            size="lg"
            type="submit"
          >
            {pending ? (
              <>
                <IconLoader2 className="animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card text-muted-foreground px-3 tracking-widest">
              Or
            </span>
          </div>
        </div>

        <Button
          className="w-full"
          disabled={googlePending}
          onClick={handleGoogleSignUp}
          size="lg"
          variant="outline"
        >
          {googlePending ? (
            <>
              <IconLoader2 className="animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <IconBrandGoogleFilled className="size-4" />
              <span>Continue with Google</span>
            </>
          )}
        </Button>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <a
            className="text-primary font-medium underline-offset-4 transition-colors hover:underline"
            href="/login"
          >
            Sign in
          </a>
        </p>
      </div>
    </>
  );
}
