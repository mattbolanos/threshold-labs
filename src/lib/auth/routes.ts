export const POST_AUTH_PATH = "/auth/continue";
export const VERIFY_EMAIL_PATH = "/verify-email";

export const getVerifyEmailPath = (email: string) =>
  `${VERIFY_EMAIL_PATH}?email=${encodeURIComponent(email.trim().toLowerCase())}`;
