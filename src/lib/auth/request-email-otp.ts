"use client";

import { convex } from "@/app/convex-client";
import { api } from "../../../convex/_generated/api";

export type EmailOtpMode = "login" | "signup";

export const requestEmailOtp = (email: string, mode: EmailOtpMode) =>
  convex.action(api.emailOtp.requestEmailOtp, { email, mode });

type EmailOtpRequestResult = Awaited<ReturnType<typeof requestEmailOtp>>;

export const getEmailOtpRequestError = (
  result: EmailOtpRequestResult,
  mode: EmailOtpMode,
) => {
  if (result.status === "signup_required") {
    return "No account exists for that email. Create an account to continue.";
  }

  if (result.status === "login_required") {
    return "An account already exists for that email. Sign in instead.";
  }

  if (result.status === "rate_limited") {
    return `Wait ${result.retryAfterSeconds} seconds before requesting another code.`;
  }

  if (result.status === "delivery_failed") {
    return "We couldn't deliver that code. Check the email address or try again later.";
  }

  if (result.status !== "sent") {
    return mode === "login"
      ? "This account is no longer available. Create an account to continue."
      : "An account already exists for that email. Sign in instead.";
  }

  return null;
};
