import { makeFunctionReference } from "convex/server";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { authComponent, createAuth, createAuthOptions } from "./auth";
import { getEmailOtpRequestStatus } from "./lib/emailOtp";

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

    const otp = await createAuth(ctx).api.createVerificationOTP({
      body: {
        email: normalizedEmail,
        type: "sign-in",
      },
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
