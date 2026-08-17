"use client";

import { IconBrandGoogleFilled, IconLoader2 } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getVerifyEmailPath, POST_AUTH_PATH } from "@/lib/auth/routes";
import { authClient } from "@/lib/auth-client";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(value: string) {
  if (!value.trim()) {
    return "Full name is required";
  }

  return undefined;
}

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

  if (value.length < 8) {
    return "Password must be at least 8 characters";
  }

  return undefined;
}

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [isGooglePending, startGoogleTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);

      await authClient.signUp.email(
        {
          callbackURL: POST_AUTH_PATH,
          email: value.email,
          name: value.name,
          password: value.password,
        },
        {
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to create account");
          },
          onSuccess: () => {
            window.location.href = getVerifyEmailPath(value.email);
          },
        },
      );
    },
  });

  const handleGoogleSignUp = () => {
    setError(null);

    startGoogleTransition(async () => {
      try {
        await authClient.signIn.social({
          callbackURL: POST_AUTH_PATH,
          errorCallbackURL: `${window.location.origin}/signup`,
          newUserCallbackURL: POST_AUTH_PATH,
          provider: "google",
        });
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to connect with Google",
        );
      }
    });
  };

  const handleSignupSubmit = async () => {
    await form.handleSubmit();
  };

  return (
    <div className="rounded-xl border bg-card/85 p-7 shadow-xl shadow-foreground/5 backdrop-blur-sm">
      <form action={handleSignupSubmit} className="space-y-4">
        <form.Field
          name="name"
          validators={{
            onBlur: ({ value }) => validateName(value),
            onSubmit: ({ value }) => validateName(value),
          }}
        >
          {(field) => {
            const nameError =
              typeof field.state.meta.errors[0] === "string"
                ? field.state.meta.errors[0]
                : undefined;

            return (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  aria-describedby={nameError ? "name-error" : undefined}
                  aria-invalid={Boolean(nameError)}
                  autoComplete="name"
                  id="name"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Your name"
                  required
                  type="text"
                  value={field.state.value}
                />
                {nameError ? (
                  <p className="text-xs text-destructive" id="name-error">
                    {nameError}
                  </p>
                ) : null}
              </div>
            );
          }}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onBlur: ({ value }) => validateEmail(value),
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
            onBlur: ({ value }) => validatePassword(value),
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
                    passwordError ? "signup-password-error" : undefined
                  }
                  aria-invalid={Boolean(passwordError)}
                  autoComplete="new-password"
                  id="password"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Create a password"
                  required
                  type="password"
                  value={field.state.value}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
                {passwordError ? (
                  <p
                    className="text-xs text-destructive"
                    id="signup-password-error"
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
              disabled={isSubmitting || isGooglePending}
              size="lg"
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                "Create account and continue"
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
            disabled={isGooglePending || isSubmitting}
            onClick={handleGoogleSignUp}
            size="lg"
            type="button"
            variant="outline"
          >
            {isGooglePending ? (
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
        Already have an account?{" "}
        <Link
          className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
          href="/login"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
