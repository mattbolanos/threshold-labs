"use client";

import { IconBrandGoogleFilled, IconLoader2 } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getVerifyEmailPath, POST_AUTH_PATH } from "@/lib/auth/routes";
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
  const [error, setError] = useState<string | null>(null);
  const [isGooglePending, startGoogleTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);

      await authClient.signIn.email(
        {
          callbackURL: POST_AUTH_PATH,
          email: value.email,
          password: value.password,
        },
        {
          onError: (ctx) => {
            if (ctx.error.code === "EMAIL_NOT_VERIFIED") {
              window.location.href = getVerifyEmailPath(value.email);
              return;
            }

            setError(ctx.error.message || "Invalid email or password");
          },
          onSuccess: () => {
            // A hard navigation ensures the new session cookie is available
            // before the server checks the account's Lab access.
            window.location.href = POST_AUTH_PATH;
          },
        },
      );
    },
  });

  const handleGoogleSignIn = () => {
    setError(null);

    startGoogleTransition(async () => {
      try {
        await authClient.signIn.social({
          callbackURL: POST_AUTH_PATH,
          errorCallbackURL: `${window.location.origin}/login`,
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

  const handleLoginSubmit = async () => {
    await form.handleSubmit();
  };

  return (
    <div className="rounded-xl border bg-card/85 p-7 shadow-xl shadow-foreground/5 backdrop-blur-sm">
      <div className="mb-7 space-y-3">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            New to Inside the Lab?
          </p>
          <p className="text-sm text-muted-foreground">
            Create an account to start your membership.
          </p>
        </div>
        <Link
          className={buttonVariants({
            className:
              "h-9 w-full border-primary/50 bg-primary/10 font-semibold text-primary hover:bg-primary/20 hover:text-primary",
            size: "lg",
            variant: "outline",
          })}
          href="/signup"
        >
          Create an account
        </Link>
      </div>

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
              disabled={isSubmitting || isGooglePending}
              size="lg"
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                "Sign in and continue"
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
            onClick={handleGoogleSignIn}
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
    </div>
  );
}
