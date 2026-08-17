export const EMAIL_VERIFICATION_EXPIRES_IN_SECONDS = 60 * 60;

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

export const createVerificationEmail = (verificationUrl: string) => {
  const safeVerificationUrl = escapeHtml(verificationUrl);

  return {
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f5f3;color:#171a18;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
      <div style="border:1px solid #d9ddd8;border-radius:12px;background:#ffffff;padding:32px;">
        <p style="margin:0 0 12px;color:#4f5b53;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Threshold Lab</p>
        <h1 style="margin:0;font-size:24px;line-height:1.25;">Verify your email</h1>
        <p style="margin:16px 0 24px;color:#4f5b53;font-size:16px;line-height:1.6;">Confirm your email address to finish creating your account. This link expires in one hour.</p>
        <a href="${safeVerificationUrl}" style="display:inline-block;border-radius:8px;background:#63d936;color:#0b1807;padding:12px 18px;font-size:15px;font-weight:700;text-decoration:none;">Verify email address</a>
        <p style="margin:24px 0 0;color:#6b756e;font-size:13px;line-height:1.5;">If you did not create a Threshold Lab account, you can ignore this email.</p>
      </div>
    </div>
  </body>
</html>`,
    subject: "Verify your Threshold Lab email",
    text: `Verify your email address to finish creating your Threshold Lab account.\n\n${verificationUrl}\n\nThis link expires in one hour. If you did not create an account, you can ignore this email.`,
  };
};
