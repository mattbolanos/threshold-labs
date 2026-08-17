import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { getAuthEnvironment } from "./lib/authEnvironment";
import { createEmailOtpMessage } from "./lib/emailOtp";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";

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
