export const EMAIL_OTP_EXPIRES_IN_SECONDS = 5 * 60;

export type EmailOtpType =
  | "change-email"
  | "email-verification"
  | "forget-password"
  | "sign-in";

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"]/g,
    (character) =>
      ({
        '"': "&quot;",
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
      })[character] ?? character,
  );

const getEmailCopy = (type: EmailOtpType) => {
  if (type === "change-email") {
    return {
      heading: "Confirm your new email",
      intro: "Enter this code to confirm your new Threshold Lab email address.",
      subject: "Confirm your new Threshold Lab email",
    };
  }

  if (type === "email-verification") {
    return {
      heading: "Verify your email",
      intro: "Enter this code to verify your Threshold Lab email address.",
      subject: "Verify your Threshold Lab email",
    };
  }

  if (type === "forget-password") {
    return {
      heading: "Reset your password",
      intro: "Enter this code to continue resetting your password.",
      subject: "Your Threshold Lab password reset code",
    };
  }

  return {
    heading: "Your sign-in code",
    intro: "Enter this code to continue to Threshold Lab.",
    subject: "Your Threshold Lab sign-in code",
  };
};

export function createEmailOtpMessage({
  otp,
  type,
}: {
  otp: string;
  type: EmailOtpType;
}) {
  const copy = getEmailCopy(type);
  const safeOtp = escapeHtml(otp);

  return {
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f5f3;color:#171a18;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
      <div style="border:1px solid #d9ddd8;border-radius:12px;background:#ffffff;padding:32px;">
        <p style="margin:0 0 12px;color:#4f5b53;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Threshold Lab</p>
        <h1 style="margin:0;font-size:24px;line-height:1.25;">${copy.heading}</h1>
        <p style="margin:16px 0;color:#4f5b53;font-size:16px;line-height:1.6;">${copy.intro}</p>
        <p style="margin:24px 0;border-radius:8px;background:#edf0ec;padding:18px;text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:30px;font-weight:700;letter-spacing:0.18em;">${safeOtp}</p>
        <p style="margin:0;color:#6b756e;font-size:13px;line-height:1.5;">This code expires in five minutes. If you did not request it, you can ignore this email.</p>
      </div>
    </div>
  </body>
</html>`,
    subject: copy.subject,
    text: `${copy.intro}\n\n${otp}\n\nThis code expires in five minutes. If you did not request it, you can ignore this email.`,
  };
}
