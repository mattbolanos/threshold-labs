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
  const [email, setEmail] = useState("long.athlete.address@example.com");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [name, setName] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [step, setStep] = useState<AuthStep>("otp");

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
        getErrorMessage(
          error,
          "Unable to send the verification email. Check your connection and try again.",
        ),
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
      setNotice("Verification email sent. Check your inbox for the new code.");
    } catch (error) {
      setRequestError(
        getErrorMessage(
          error,
          "Unable to resend the verification email. Check your connection and try again.",
        ),
      );
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
        setRequestError(
          error.message || "Unable to connect to Google. Try again.",
        );
        setPendingAction(null);
      }
    } catch (error) {
      setRequestError(
        getErrorMessage(error, "Unable to connect to Google. Try again."),
      );
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
      <CardContent className={step === "otp" ? "space-y-6" : undefined}>
        {step === "otp" ? (
          <div className="space-y-1.5">
            <h2 className="text-base font-medium" id="email-otp-title">
              Check your email
            </h2>
            <p
              className="leading-relaxed text-muted-foreground"
              id="email-otp-description"
            >
              Enter the six-digit code sent to{" "}
              <bdi className="break-words font-medium text-foreground">
                {email}
              </bdi>
              . It expires in 5 minutes.
            </p>
          </div>
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

              <Button
                className="w-full active:scale-96"
                disabled={isBusy}
                size="lg"
                type="submit"
              >
                {pendingAction === "send-code" ? (
                  <Spinner data-icon="inline-start" />
                ) : null}
                {pendingAction === "send-code"
                  ? "Sending email…"
                  : "Send verification email"}
              </Button>

              <FieldSeparator>Or</FieldSeparator>

              <Button
                className="w-full active:scale-96"
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
                className="items-center gap-3"
                data-disabled={isBusy ? true : undefined}
                data-invalid={fieldErrors.otp ? true : undefined}
              >
                <InputOTP
                  aria-describedby={
                    fieldErrors.otp
                      ? "email-otp-error"
                      : "email-otp-description"
                  }
                  aria-invalid={Boolean(fieldErrors.otp)}
                  aria-labelledby="email-otp-title"
                  autoComplete="one-time-code"
                  autoFocus
                  containerClassName="w-full justify-center"
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
                        className="h-11 w-10 text-xl"
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
                        className="h-11 w-10 text-xl"
                        index={index}
                        key={index}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                <FieldError className="text-center" id="email-otp-error">
                  {fieldErrors.otp}
                </FieldError>
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

              <div className="flex flex-col gap-3">
                <Button
                  className="w-full active:scale-96"
                  disabled={isBusy}
                  size="lg"
                  type="submit"
                >
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
                <Button
                  className="w-full active:scale-96"
                  disabled={isBusy}
                  onClick={resendCode}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  {pendingAction === "resend-code" ? (
                    <Spinner data-icon="inline-start" />
                  ) : null}
                  {pendingAction === "resend-code"
                    ? "Resending email…"
                    : "Resend verification email"}
                </Button>
              </div>
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
        <CardFooter className="justify-center">
          <Button
            className="w-full active:scale-96"
            disabled={isBusy}
            onClick={changeEmail}
            type="button"
            variant="outline"
          >
            Use another email
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
