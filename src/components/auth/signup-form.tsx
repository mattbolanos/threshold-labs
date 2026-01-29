"use client";

import {
  IconBrandGoogleFilled,
  IconLoader2,
  IconMailX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";

type ErrorState = {
  type: "generic" | "not-invited";
  message: string;
} | null;

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ErrorState>(null);
  const [pending, startPending] = useTransition();
  const [googlePending, startGooglePending] = useTransition();
  const router = useRouter();

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
            const message = ctx.error.message || "Failed to create account";
            const isNotInvited = ctx.error.status === 422;

            setError({
              message,
              type: isNotInvited ? "not-invited" : "generic",
            });
          },
          onSuccess: () => {
            router.push("/");
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
        errorCallbackURL: "/signup?error=google",
        newUserCallbackURL: "/",
        provider: "google",
      });
    });
  };

  // Show prominent "not invited" state
  if (error?.type === "not-invited") {
    return (
      <div className="bg-card/80 rounded-2xl border p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
        <div className="flex flex-col items-center text-center">
          <div className="bg-destructive/10 mb-4 flex size-14 items-center justify-center rounded-full">
            <IconMailX className="text-destructive size-7" />
          </div>
          <h2 className="text-lg font-semibold">No Invitation Found</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            The email{" "}
            <span className="text-foreground font-medium">{email}</span> is not
            on the invite list.
          </p>
          <div className="bg-muted/50 mt-5 w-full rounded-lg p-4 text-left text-sm">
            <p className="font-medium">What to do next:</p>
            <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
              <li>Contact your coach to request an invitation</li>
              <li>Make sure you&apos;re using the email your coach has</li>
              <li>Check for typos in your email address</li>
            </ul>
          </div>
          <Button
            className="mt-6 w-full"
            onClick={() => setError(null)}
            size="lg"
            variant="outline"
          >
            Try a Different Email
          </Button>
          <p className="text-muted-foreground mt-4 text-sm">
            Already have an account?{" "}
            <a
              className="text-foreground font-medium underline-offset-4 transition-colors hover:underline"
              href="/login"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Invite-only notice */}
      <div className="border-primary/20 bg-primary/5 mb-4 rounded-xl border px-4 py-3 text-center text-sm">
        <span className="font-medium">Invite Only</span>
        <span className="text-muted-foreground mx-2">|</span>
        <span className="text-muted-foreground">
          Registration requires a coach invitation
        </span>
      </div>

      {/* Form Card */}
      <div className="bg-card/80 rounded-2xl border p-8 shadow-xl shadow-black/5 backdrop-blur-sm">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
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

          {error?.type === "generic" && (
            <div
              aria-live="polite"
              className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm"
              role="alert"
            >
              {error.message}
            </div>
          )}

          <Button
            className="w-full text-black"
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
              <IconBrandGoogleFilled className="size-5" />
              <span>Google</span>
            </>
          )}
        </Button>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <a
            className="text-foreground font-medium underline-offset-4 transition-colors hover:underline"
            href="/login"
          >
            Sign in
          </a>
        </p>
      </div>
    </>
  );
}
