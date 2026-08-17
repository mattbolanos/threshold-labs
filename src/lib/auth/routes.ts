export const POST_AUTH_PATH = "/auth/continue";
export const EMAIL_OTP_LOGIN_SUCCESS_PATH = "/lab/lab-notes";
export const SIGNUP_SUCCESS_PATH = "/subscribe";

export const getEmailOtpSuccessPath = (mode: "login" | "signup") =>
  mode === "signup" ? SIGNUP_SUCCESS_PATH : EMAIL_OTP_LOGIN_SUCCESS_PATH;
