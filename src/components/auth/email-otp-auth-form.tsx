"use client";

import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import {
  type EmailOtpMode,
  getEmailOtpRequestError,
  requestEmailOtp,
} from "@/lib/auth/request-email-otp";
import { EMAIL_OTP_SUCCESS_PATH, POST_AUTH_PATH } from "@/lib/auth/routes";
import { authClient } from "@/lib/auth-client";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpIndexes = [0, 1, 2, 3, 4, 5] as const;

type AuthStep = "email" | "otp";
type PendingAction =
  | "google"
  | "redirect"
  | "resend-code"
  | "send-code"
  | "verify-code"
  | null;

interface EmailOtpAuthFormProps {
  mode: EmailOtpMode;
}

interface FieldErrors {
  email?: string;
  name?: string;
  otp?: string;
}

const normalizeEmail = (value: string) => value.trim().toLowerCase();

function getEmailError(value: string) {
  if (!value.trim()) {
    return "Email is required";
  }

  if (!emailPattern.test(value)) {
    return "Enter a valid email address";
  }

  return undefined;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function EmailOtpAuthForm({ mode }: EmailOtpAuthFormProps) {
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [name, setName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [step, setStep] = useState<AuthStep>("email");

  const isBusy = pendingAction !== null;

  const sendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = normalizeEmail(email);
    const nextErrors: FieldErrors = {
      email: getEmailError(normalizedEmail),
      name: isSignup && !name.trim() ? "Full name is required" : undefined,
    };

    setFieldErrors(nextErrors);
    setNotice(null);
    setRequestError(null);

    if (nextErrors.email || nextErrors.name) {
      return;
    }

    setPendingAction("send-code");

    try {
      const result = await requestEmailOtp(normalizedEmail, mode);
      const resultError = getEmailOtpRequestError(result, mode);

      if (resultError) {
        setRequestError(resultError);
        return;
      }

      setEmail(normalizedEmail);
      setOtp("");
      setStep("otp");
    } catch (error) {
      setRequestError(
        getErrorMessage(error, "We couldn't send a code. Try again."),
      );
    } finally {
      setPendingAction(null);
    }
  };

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    setRequestError(null);

    if (otp.length !== 6) {
      setFieldErrors({ otp: "Enter the six-digit code" });
      return;
    }

    setFieldErrors({});
    setPendingAction("verify-code");
    let isRedirecting = false;

    try {
      const { error } = await authClient.signIn.emailOtp({
        email,
        name: isSignup ? name.trim() : undefined,
        otp,
      });

      if (error) {
        setRequestError(
          error.message ||
            "That code is invalid or expired. Request a new one.",
        );
        return;
      }

      isRedirecting = true;
      setPendingAction("redirect");
      window.location.replace(EMAIL_OTP_SUCCESS_PATH);
    } catch (error) {
      setRequestError(
        getErrorMessage(
          error,
          "That code is invalid or expired. Request a new one.",
        ),
      );
    } finally {
      if (!isRedirecting) {
        setPendingAction(null);
      }
    }
  };

  const resendCode = async () => {
    setNotice(null);
    setRequestError(null);
    setPendingAction("resend-code");

    try {
      const result = await requestEmailOtp(email, mode);
      const resultError = getEmailOtpRequestError(result, mode);

      if (resultError) {
        setRequestError(resultError);
        return;
      }

      setOtp("");
      setFieldErrors({});
      setNotice("A new code is on its way.");
    } catch (error) {
      setRequestError(getErrorMessage(error, "We couldn't resend the code."));
    } finally {
      setPendingAction(null);
    }
  };

  const changeEmail = () => {
    setFieldErrors({});
    setNotice(null);
    setOtp("");
    setRequestError(null);
    setStep("email");
  };

  const continueWithGoogle = async () => {
    setNotice(null);
    setRequestError(null);
    setPendingAction("google");

    try {
      const { error } = await authClient.signIn.social({
        callbackURL: POST_AUTH_PATH,
        errorCallbackURL: `${window.location.origin}/${mode}`,
        newUserCallbackURL: isSignup ? POST_AUTH_PATH : undefined,
        provider: "google",
      });

      if (error) {
        setRequestError(error.message || "Failed to connect with Google.");
        setPendingAction(null);
      }
    } catch (error) {
      setRequestError(getErrorMessage(error, "Failed to connect with Google."));
      setPendingAction(null);
    }
  };

  const updateOtp = (value: string) => {
    setOtp(value);
    if (fieldErrors.otp) {
      setFieldErrors({});
    }
  };

  return (
    <Card className="w-full">
      <CardContent>
        {step === "otp" ? (
          <>
            We sent a six-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>. It
            expires in five minutes.
          </>
        ) : null}
        {step === "email" ? (
          <form noValidate onSubmit={sendCode}>
            <FieldGroup>
              {isSignup ? (
                <Field
                  data-disabled={isBusy ? true : undefined}
                  data-invalid={fieldErrors.name ? true : undefined}
                >
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <Input
                    aria-describedby={
                      fieldErrors.name ? "signup-name-error" : undefined
                    }
                    aria-invalid={Boolean(fieldErrors.name)}
                    autoComplete="name"
                    disabled={isBusy}
                    id="name"
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    required
                    value={name}
                  />
                  <FieldError id="signup-name-error">
                    {fieldErrors.name}
                  </FieldError>
                </Field>
              ) : null}

              <Field
                data-disabled={isBusy ? true : undefined}
                data-invalid={fieldErrors.email ? true : undefined}
              >
                <FieldLabel htmlFor={`${mode}-email`}>Email</FieldLabel>
                <Input
                  aria-describedby={
                    fieldErrors.email ? `${mode}-email-error` : undefined
                  }
                  aria-invalid={Boolean(fieldErrors.email)}
                  autoComplete="email"
                  disabled={isBusy}
                  id={`${mode}-email`}
                  inputMode="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="athlete@example.com"
                  required
                  type="email"
                  value={email}
                />
                <FieldError id={`${mode}-email-error`}>
                  {fieldErrors.email}
                </FieldError>
              </Field>

              {requestError ? (
                <Alert variant="destructive">
                  <AlertDescription>{requestError}</AlertDescription>
                </Alert>
              ) : null}

              <Button disabled={isBusy} size="lg" type="submit">
                {pendingAction === "send-code" ? (
                  <Spinner data-icon="inline-start" />
                ) : null}
                {pendingAction === "send-code"
                  ? "Sending code…"
                  : "Email me a code"}
              </Button>

              <FieldSeparator>Or</FieldSeparator>

              <Button
                disabled={isBusy}
                onClick={continueWithGoogle}
                size="lg"
                type="button"
                variant="outline"
              >
                {pendingAction === "google" ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <IconBrandGoogleFilled data-icon="inline-start" />
                )}
                {pendingAction === "google"
                  ? "Connecting…"
                  : "Continue with Google"}
              </Button>
            </FieldGroup>
          </form>
        ) : (
          <form noValidate onSubmit={verifyCode}>
            <FieldGroup>
              <Field
                data-disabled={isBusy ? true : undefined}
                data-invalid={fieldErrors.otp ? true : undefined}
              >
                <FieldLabel htmlFor="email-otp">Verification code</FieldLabel>
                <InputOTP
                  aria-describedby={
                    fieldErrors.otp
                      ? "email-otp-error"
                      : "email-otp-description"
                  }
                  aria-invalid={Boolean(fieldErrors.otp)}
                  autoComplete="one-time-code"
                  autoFocus
                  containerClassName="justify-center"
                  disabled={isBusy}
                  id="email-otp"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={updateOtp}
                  pattern={REGEXP_ONLY_DIGITS}
                  value={otp}
                >
                  <InputOTPGroup>
                    {otpIndexes.slice(0, 3).map((index) => (
                      <InputOTPSlot
                        aria-invalid={Boolean(fieldErrors.otp)}
                        index={index}
                        key={index}
                      />
                    ))}
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    {otpIndexes.slice(3).map((index) => (
                      <InputOTPSlot
                        aria-invalid={Boolean(fieldErrors.otp)}
                        index={index}
                        key={index}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <FieldDescription id="email-otp-description">
                  Paste the code or enter each digit.
                </FieldDescription>
                <FieldError id="email-otp-error">{fieldErrors.otp}</FieldError>
              </Field>

              {requestError ? (
                <Alert variant="destructive">
                  <AlertDescription>{requestError}</AlertDescription>
                </Alert>
              ) : null}

              {notice ? (
                <Alert>
                  <AlertDescription>{notice}</AlertDescription>
                </Alert>
              ) : null}

              <Button disabled={isBusy} size="lg" type="submit">
                {pendingAction === "verify-code" ||
                pendingAction === "redirect" ? (
                  <Spinner data-icon="inline-start" />
                ) : null}
                {pendingAction === "redirect"
                  ? "Opening the lab…"
                  : pendingAction === "verify-code"
                    ? "Verifying…"
                    : "Verify and continue"}
              </Button>
            </FieldGroup>
          </form>
        )}
      </CardContent>

      {step === "email" ? (
        <CardFooter className="justify-center gap-1">
          <span className="text-muted-foreground">
            {isSignup ? "Already have an account?" : "New to Inside the Lab?"}
          </span>
          <Button
            nativeButton={false}
            render={<Link href={isSignup ? "/login" : "/signup"} />}
            size="sm"
            variant="link"
          >
            {isSignup ? "Sign in" : "Create an account"}
          </Button>
        </CardFooter>
      ) : (
        <CardFooter className="flex-col gap-2 sm:flex-row">
          <Button
            className="w-full"
            disabled={isBusy}
            onClick={changeEmail}
            type="button"
            variant="outline"
          >
            Use another email
          </Button>
          <Button
            className="w-full"
            disabled={isBusy}
            onClick={resendCode}
            type="button"
            variant="outline"
          >
            {pendingAction === "resend-code" ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            {pendingAction === "resend-code" ? "Resending…" : "Resend code"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
