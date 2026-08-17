import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { getAuthEnvironment } from "./lib/authEnvironment";
import { createVerificationEmail } from "./lib/verificationEmail";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";

export const sendVerificationEmail = internalAction({
  args: {
    recipient: v.string(),
    verificationUrl: v.string(),
  },
  handler: async (ctx, { recipient, verificationUrl }) => {
    const email = createVerificationEmail(verificationUrl);
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
      throw new Error(
        `Resend rejected a verification email with status ${response.status}.`,
      );
    }
  },
});
