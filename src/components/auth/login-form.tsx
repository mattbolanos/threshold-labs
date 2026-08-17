"use client";

import { EmailOtpAuthForm } from "@/components/auth/email-otp-auth-form";

export function LoginForm() {
  return <EmailOtpAuthForm mode="login" />;
}
