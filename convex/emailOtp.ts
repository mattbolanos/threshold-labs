import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { authComponent, createAuth, createAuthOptions } from "./auth";
import { getEmailOtpRequestStatus } from "./lib/emailOtp";
import {
  clearSignInOtps,
  EMAIL_OTP_SIGN_IN_PATH,
  type EmailOtpHttpResponse,
  serializeAuthResponse,
} from "./lib/emailOtpAuth";

const emailOtpModeValidator = v.union(v.literal("login"), v.literal("signup"));

const claimEmailOtpRequest = makeFunctionReference<
  "mutation",
  { email: string },
  { allowed: boolean; retryAfterSeconds: number }
>("emailOtpRateLimit:claimEmailOtpRequest");

const sendEmailOtp = makeFunctionReference<
  "action",
  {
    otp: string;
    recipient: string;
    type: "sign-in";
  },
  null
>("emails:sendEmailOtp");

const createEmailOtpRef = makeFunctionReference<
  "mutation",
  { email: string },
  string
>("emailOtp:createEmailOtp");

export const createEmailOtp = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, { email }): Promise<string> => {
    const auth = createAuth(ctx);
    const { adapter } = await auth.$context;
    const normalizedEmail = email.trim().toLowerCase();
    await clearSignInOtps(adapter, normalizedEmail);
    return auth.api.createVerificationOTP({
      body: { email: normalizedEmail, type: "sign-in" },
    });
  },
});

export const signInEmailOtp = internalMutation({
  args: {
    body: v.string(),
    headers: v.record(v.string(), v.string()),
    url: v.string(),
  },
  handler: async (
    ctx,
    { body, headers, url },
  ): Promise<EmailOtpHttpResponse> => {
    if (new URL(url).pathname !== EMAIL_OTP_SIGN_IN_PATH) {
      throw new Error("Only email OTP sign-in can use this transaction.");
    }
    const auth = createAuth(ctx);
    const request = new Request(url, { body, headers, method: "POST" });
    const input = await request
      .clone()
      .json()
      .catch(() => null);
    if (typeof input?.email === "string") {
      const { adapter } = await auth.$context;
      // Remove duplicates left by earlier versions before Better Auth consumes
      // by identifier. Its Convex adapter deletes only one matching record.
      await clearSignInOtps(adapter, input.email.toLowerCase(), true);
    }
    // The handler returns failed attempts as HTTP responses, so their updated
    // attempt count commits instead of rolling back with a thrown APIError.
    return serializeAuthResponse(await auth.handler(request));
  },
});

export const requestEmailOtp = action({
  args: {
    email: v.string(),
    mode: emailOtpModeValidator,
  },
  handler: async (ctx, { email, mode }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const adapter = authComponent.adapter(ctx)(createAuthOptions(ctx));
    const user = await adapter.findOne<{ id: string }>({
      model: "user",
      where: [{ field: "email", value: normalizedEmail }],
    });
    const status = getEmailOtpRequestStatus({
      mode,
      userExists: Boolean(user),
    });

    if (status !== "sent") {
      return { status };
    }

    const rateLimit = await ctx.runMutation(claimEmailOtpRequest, {
      email: normalizedEmail,
    });

    if (!rateLimit.allowed) {
      return {
        retryAfterSeconds: rateLimit.retryAfterSeconds,
        status: "rate_limited" as const,
      };
    }

    const otp = await ctx.runMutation(createEmailOtpRef, {
      email: normalizedEmail,
    });

    try {
      await ctx.runAction(sendEmailOtp, {
        otp,
        recipient: normalizedEmail,
        type: "sign-in",
      });
    } catch {
      return { status: "delivery_failed" as const };
    }

    return { status: "sent" as const };
  },
});
