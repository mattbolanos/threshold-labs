export const POST_AUTH_PATH = "/auth/continue";
export const EMAIL_OTP_LOGIN_SUCCESS_PATH = "/lab/lab-notes";
export const SIGNUP_SUCCESS_PATH = "/subscribe";

export type CheckoutOption = "bundle" | "membership" | `block:${string}`;

export function parseCheckoutOption(
  value: string | null | undefined,
): CheckoutOption | null {
  if (value === "bundle" || value === "membership") return value;
  return value && /^block:[a-zA-Z0-9_-]+$/.test(value)
    ? (value as CheckoutOption)
    : null;
}

export function getCheckoutReturnPath(option: CheckoutOption) {
  return `/subscribe?purchase=${encodeURIComponent(option)}`;
}

/** Only the public catalog is a supported auth return destination. */
export function getSafeAuthReturnPath(value: string | null | undefined) {
  if (value === "/subscribe") return value;
  if (!value?.startsWith("/subscribe?")) return null;
  const option = parseCheckoutOption(
    new URLSearchParams(value.slice(11)).get("purchase"),
  );
  return option ? getCheckoutReturnPath(option) : null;
}

export const getEmailOtpSuccessPath = (
  mode: "login" | "signup",
  next?: string | null,
) =>
  getSafeAuthReturnPath(next) ??
  (mode === "signup" ? SIGNUP_SUCCESS_PATH : EMAIL_OTP_LOGIN_SUCCESS_PATH);
