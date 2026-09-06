import { ConvexError, v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { authComponent } from "./auth";
import { getAuthEnvironment } from "./lib/authEnvironment";
import { createDiscountCodeEmailMessage } from "./lib/discountCodeEmail";
import { createEmailOtpMessage } from "./lib/emailOtp";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";

export const sendContactMessage = action({
  args: { message: v.string() },
  handler: async (ctx, { message }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Please sign in to send a message.");
    }

    const text = message.trim();
    if (!text || text.length > 5000) {
      throw new ConvexError("Enter a message between 1 and 5,000 characters.");
    }

    const response = await fetch(RESEND_EMAILS_URL, {
      body: JSON.stringify({
        from: getAuthEnvironment(ctx, "AUTH_EMAIL_FROM"),
        reply_to: user.email,
        subject: "Threshold Lab contact message",
        text: `From: ${user.name} <${user.email}>\n\n${text}`,
        to: ["stephen.pelkofer@gmail.com"],
      }),
      headers: {
        Authorization: `Bearer ${getAuthEnvironment(ctx, "RESEND_API_KEY")}`,
        "Content-Type": "application/json",
        "User-Agent": "threshold-lab/1.0",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new ConvexError(
        "Your message could not be sent. Please try again.",
      );
    }
    return null;
  },
});

export const sendEmailOtp = internalAction({
  args: {
    otp: v.string(),
    recipient: v.string(),
    type: v.union(
      v.literal("change-email"),
      v.literal("email-verification"),
      v.literal("forget-password"),
      v.literal("sign-in"),
    ),
  },
  handler: async (ctx, { otp, recipient, type }) => {
    const email = createEmailOtpMessage({ otp, type });
    const response = await fetch(RESEND_EMAILS_URL, {
      body: JSON.stringify({
        from: getAuthEnvironment(ctx, "AUTH_EMAIL_FROM"),
        to: [recipient],
        ...email,
      }),
      headers: {
        Authorization: `Bearer ${getAuthEnvironment(ctx, "RESEND_API_KEY")}`,
        "Content-Type": "application/json",
        "User-Agent": "threshold-lab/1.0",
      },
      method: "POST",
    });

    if (!response.ok) {
      const responseBody = (await response.text()).slice(0, 1000);
      throw new Error(
        `Resend rejected an OTP email with status ${response.status}: ${responseBody}`,
      );
    }
  },
});

export const sendDiscountCodeEmail = internalAction({
  args: {
    code: v.string(),
    discountType: v.union(
      v.literal("fifty_monthly"),
      v.literal("free_forever"),
    ),
    recipient: v.string(),
  },
  handler: async (ctx, { code, discountType, recipient }) => {
    const email = createDiscountCodeEmailMessage({
      code,
      discountType,
      recipientEmail: recipient,
      signupUrl: new URL(
        "/signup",
        getAuthEnvironment(ctx, "SITE_URL"),
      ).toString(),
    });
    const response = await fetch(RESEND_EMAILS_URL, {
      body: JSON.stringify({
        from: getAuthEnvironment(ctx, "AUTH_EMAIL_FROM"),
        to: [recipient],
        ...email,
      }),
      headers: {
        Authorization: `Bearer ${getAuthEnvironment(ctx, "RESEND_API_KEY")}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `discount-code/${code}`,
        "User-Agent": "threshold-lab/1.0",
      },
      method: "POST",
    });

    if (!response.ok) {
      const responseBody = (await response.text()).slice(0, 1000);
      throw new Error(
        `Resend rejected a discount-code email with status ${response.status}: ${responseBody}`,
      );
    }
  },
});
