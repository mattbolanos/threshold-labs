import type { DiscountCodeType } from "./discountCodes";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export function normalizeDiscountCodeRecipient(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail.length === 0 ||
    normalizedEmail.length > 254 ||
    !EMAIL_PATTERN.test(normalizedEmail)
  ) {
    throw new Error("Enter a valid recipient email address.");
  }

  return normalizedEmail;
}

function getOfferCopy(discountType: DiscountCodeType) {
  if (discountType === "free_forever") {
    return {
      description:
        "This code makes an Inside the Lab subscription free for the life of that subscription.",
      heading: "Your free-forever code",
      subject: "Your free Inside the Lab membership code",
    };
  }

  return {
    description:
      "This code sets an Inside the Lab subscription to $50 per month for the life of that subscription.",
    heading: "Your $50/month code",
    subject: "Your $50/month Inside the Lab membership code",
  };
}

export function createDiscountCodeEmailMessage({
  code,
  discountType,
  signupUrl,
}: {
  code: string;
  discountType: DiscountCodeType;
  signupUrl: string;
}) {
  const copy = getOfferCopy(discountType);
  const safeCode = escapeHtml(code);
  const safeSignupUrl = escapeHtml(signupUrl);

  return {
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f5f3;color:#171a18;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:36px 20px;">
      <div style="border:1px solid #d9ddd8;border-radius:12px;background:#ffffff;padding:32px;">
        <p style="margin:0 0 12px;color:#4f5b53;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Threshold Lab</p>
        <h1 style="margin:0;font-size:24px;line-height:1.25;">${copy.heading}</h1>
        <p style="margin:16px 0;color:#4f5b53;font-size:16px;line-height:1.6;">${copy.description}</p>
        <p style="margin:24px 0;border-radius:8px;background:#edf0ec;padding:18px;text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:24px;font-weight:700;letter-spacing:0.08em;">${safeCode}</p>
        <p style="margin:0 0 24px;color:#6b756e;font-size:13px;line-height:1.5;">Sign up or sign in, then enter this code in Stripe Checkout. It can only be used once, so please do not forward it.</p>
        <a href="${safeSignupUrl}" style="display:inline-block;border-radius:8px;background:#171a18;color:#ffffff;padding:12px 18px;text-decoration:none;font-size:14px;font-weight:700;">Claim membership</a>
      </div>
    </div>
  </body>
</html>`,
    subject: copy.subject,
    text: `${copy.description}\n\nYour code: ${code}\n\nSign up or sign in at ${signupUrl}, then enter this code in Stripe Checkout. It can only be used once, so please do not forward it.`,
  };
}
