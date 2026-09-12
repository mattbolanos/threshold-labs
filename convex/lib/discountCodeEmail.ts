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
        "Inside the Lab is free for you, for life. Every workout, past and present, is included.",
      heading: "Your free Inside the Lab membership",
      nextStep: "Nothing to pay and no card needed. Just confirm.",
      subject: "Your free Inside the Lab membership",
    };
  }

  return {
    description:
      "Inside the Lab is $50/month for you, for life. Every workout, past and present, is included.",
    heading: "Your $50/month Inside the Lab membership",
    nextStep: "Add a payment method to lock in $50/month for life.",
    subject: "Your $50/month Inside the Lab membership",
  };
}

export function createDiscountCodeEmailMessage({
  code,
  discountType,
  recipientEmail,
  signupUrl,
}: {
  code: string;
  discountType: DiscountCodeType;
  recipientEmail: string;
  signupUrl: string;
}) {
  const copy = getOfferCopy(discountType);
  const safeCode = escapeHtml(code);
  const safeRecipient = escapeHtml(recipientEmail);
  const safeSignupUrl = escapeHtml(signupUrl);
  const instructions = `Sign in or sign up with ${recipientEmail} and checkout opens with the offer already applied. ${copy.nextStep}`;
  const restriction = `This offer is tied to ${recipientEmail}. No code to enter and nothing to forward.`;

  return {
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f5f3;color:#171a18;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:36px 20px;">
      <div style="border:1px solid #d9ddd8;border-radius:12px;background:#ffffff;padding:32px;">
        <p style="margin:0 0 12px;color:#4f5b53;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Threshold Lab</p>
        <h1 style="margin:0;font-size:24px;line-height:1.25;">${copy.heading}</h1>
        <p style="margin:16px 0;color:#4f5b53;font-size:16px;line-height:1.6;">${copy.description}</p>
        <p style="margin:0 0 24px;color:#4f5b53;font-size:16px;line-height:1.6;">Sign in or sign up with <strong>${safeRecipient}</strong> and checkout opens with the offer already applied. ${escapeHtml(copy.nextStep)}</p>
        <a href="${safeSignupUrl}" style="display:inline-block;border-radius:8px;background:#171a18;color:#ffffff;padding:12px 18px;text-decoration:none;font-size:14px;font-weight:700;">Claim membership</a>
        <p style="margin:24px 0 0;color:#6b756e;font-size:13px;line-height:1.5;">${escapeHtml(restriction)} Offer reference: ${safeCode}</p>
      </div>
    </div>
  </body>
</html>`,
    subject: copy.subject,
    text: `${copy.description}\n\n${instructions}\n\nClaim membership: ${signupUrl}\n\n${restriction} Offer reference: ${code}`,
  };
}
