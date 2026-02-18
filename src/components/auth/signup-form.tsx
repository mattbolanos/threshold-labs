"use client";

import { IconBrandGoogleFilled, IconLoader2 } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [googlePending, setGooglePending] = useState(false);

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
          callbackURL: "/",
          email: value.email,
          name: value.name,
          password: value.password,
        },
        {
          onError: (ctx) => {
            const isNotInvited = ctx.error.status === 422;

            if (isNotInvited) {
              window.location.href = `/unauthorized?email=${encodeURIComponent(value.email)}`;
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
    },
  });

  const handleGoogleSignUp = async () => {
    setError(null);

    setGooglePending(true);

    await authClient.signIn
      .social({
        callbackURL: "/",
        errorCallbackURL: `${window.location.origin}/unauthorized`,
        newUserCallbackURL: "/",
        provider: "google",
      })
      .catch((error) => {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to connect with Google",
        );
      });

    setGooglePending(false);
  };

  const handleSignupSubmit = async () => {
    await form.handleSubmit();
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
        <form
          action={handleSignupSubmit}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => validateName(value),
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
                    <p className="text-destructive text-xs" id="name-error">
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
                    <p className="text-destructive text-xs" id="email-error">
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
                  <p className="text-muted-foreground text-xs">
                    Must be at least 8 characters
                  </p>
                  {passwordError ? (
                    <p
                      className="text-destructive text-xs"
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
              className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                className="w-full font-semibold tracking-wide"
                disabled={isSubmitting || googlePending}
                size="lg"
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 className="animate-spin" />
                    <span>Creating account…</span>
                  </>
                ) : (
                  "Create Account"
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
            <span className="bg-card text-muted-foreground px-3 tracking-widest">
              Or
            </span>
          </div>
        </div>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              className="w-full"
              disabled={googlePending || isSubmitting}
              onClick={handleGoogleSignUp}
              size="lg"
              variant="outline"
            >
              {googlePending ? (
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

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            className="text-primary font-medium underline-offset-4 transition-colors hover:underline"
            href="/login"
            prefetch
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
