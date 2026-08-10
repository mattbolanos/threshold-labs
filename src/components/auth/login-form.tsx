"use client";

import { IconBrandGoogleFilled, IconLoader2 } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string) {
  if (!value.trim()) {
    return "Email is required";
  }

  if (!emailPattern.test(value)) {
    return "Enter a valid email address";
  }

  return undefined;
}

function validatePassword(value: string) {
  if (!value.trim()) {
    return "Password is required";
  }

  return undefined;
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);

      await authClient.signIn.email(
        {
          callbackURL: "/lab-notes",
          email: value.email,
          password: value.password,
        },
        {
          onError: (ctx) => {
            setError(ctx.error.message || "Invalid email or password");
          },
          onSuccess: () => {
            router.push("/lab-notes");
            router.refresh();
          },
        },
      );
    },
  });

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);

    await authClient.signIn
      .social({
        callbackURL: "/lab-notes",
        errorCallbackURL: `${window.location.origin}/unauthorized`,
        provider: "google",
      })
      .catch((error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to connect with Google",
        );
      });

    setIsGoogleLoading(false);
  };

  const handleLoginSubmit = async () => {
    await form.handleSubmit();
  };

  return (
    <div className="rounded-xl border bg-card/85 p-7 shadow-xl shadow-foreground/5 backdrop-blur-sm">
      <form action={handleLoginSubmit} className="space-y-4">
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => validateEmail(value),
            onSubmit: ({ value }) => validateEmail(value),
          }}
        >
          {(field) => {
            const emailError =
              typeof field.state.meta.errors[0] === "string"
                ? field.state.meta.errors[0]
                : undefined;

            return (
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  aria-describedby={emailError ? "email-error" : undefined}
                  aria-invalid={Boolean(emailError)}
                  autoComplete="email"
                  id="email"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="athlete@example.com"
                  required
                  type="email"
                  value={field.state.value}
                />
                {emailError ? (
                  <p className="text-xs text-destructive" id="email-error">
                    {emailError}
                  </p>
                ) : null}
              </div>
            );
          }}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => validatePassword(value),
            onSubmit: ({ value }) => validatePassword(value),
          }}
        >
          {(field) => {
            const passwordError =
              typeof field.state.meta.errors[0] === "string"
                ? field.state.meta.errors[0]
                : undefined;

            return (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  aria-describedby={
                    passwordError ? "login-password-error" : undefined
                  }
                  aria-invalid={Boolean(passwordError)}
                  autoComplete="current-password"
                  id="password"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={field.state.value}
                />
                {passwordError ? (
                  <p
                    className="text-xs text-destructive"
                    id="login-password-error"
                  >
                    {passwordError}
                  </p>
                ) : null}
              </div>
            );
          }}
        </form.Field>

        {error && (
          <div
            aria-live="polite"
            className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              className="w-full font-semibold tracking-wide"
              disabled={isSubmitting || isGoogleLoading}
              size="lg"
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 tracking-widest text-muted-foreground">
            Or
          </span>
        </div>
      </div>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            className="w-full"
            disabled={isGoogleLoading || isSubmitting}
            onClick={handleGoogleSignIn}
            size="lg"
            variant="outline"
          >
            {isGoogleLoading ? (
              <>
                <IconLoader2 className="animate-spin" />
                <span>Connecting…</span>
              </>
            ) : (
              <>
                <IconBrandGoogleFilled className="size-4" />
                <span>Continue with Google</span>
              </>
            )}
          </Button>
        )}
      </form.Subscribe>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
          href="/signup"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
