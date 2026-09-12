import { stripe } from "@better-auth/stripe";
import type { GenericCtx } from "@convex-dev/better-auth";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import Stripe from "stripe";
import type { DataModel } from "../_generated/dataModel";
import { getAuthEnvironment } from "./authEnvironment";
import { ensureRecipientPromotionCode } from "./discountCheckout";
import { INSIDE_LAB_PLAN_NAME } from "./labAccess";
import { ensureStripeCustomer } from "./stripeCustomer";
import { fulfillStripeEvent } from "./stripeFulfillment";

const STRIPE_API_VERSION = "2026-07-29.dahlia";

export function getStripeCheckoutBrandingSettings(siteUrl: string) {
  return {
    background_color: "#030504" as const,
    border_style: "rounded" as const,
    button_color: "#7AF440",
    display_name: "Threshold Lab",
    font_family: "inter" as const,
    icon: {
      type: "url" as const,
      url: new URL("/web-app-manifest-512x512.png", siteUrl).toString(),
    },
  };
}

export function createStripeClient(ctx: GenericCtx<DataModel>) {
  return new Stripe(getAuthEnvironment(ctx, "STRIPE_SECRET_KEY"), {
    apiVersion: STRIPE_API_VERSION,
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function createStripeCheckoutHook(ctx: GenericCtx<DataModel>) {
  return createAuthMiddleware(async (request) => {
    if (request.path !== "/subscription/upgrade") return;

    const session = await getSessionFromCtx<{
      stripeCustomerId?: string | null;
    }>(request, { disableCookieCache: true });
    if (!session) return;

    session.user.stripeCustomerId = await ensureStripeCustomer(
      createStripeClient(ctx),
      request.context.adapter,
      session.user,
    );
    return { context: { session } };
  });
}

export function createStripeAuthPlugin(ctx: GenericCtx<DataModel>) {
  const siteUrl = getAuthEnvironment(ctx, "SITE_URL");
  const stripeClient = createStripeClient(ctx);
  const stripeWebhookSecret = getAuthEnvironment(ctx, "STRIPE_WEBHOOK_SECRET");

  const plugin = stripe({
    createCustomerOnSignUp: false,
    stripeClient,
    stripeWebhookSecret,
    subscription: {
      enabled: true,
      getCheckoutSessionParams: async ({ subscription, user }) => {
        const recipientPromotionCodeId = await ensureRecipientPromotionCode(
          ctx,
          stripeClient,
          {
            email: user.email,
            stripeCustomerId:
              subscription.stripeCustomerId ?? user.stripeCustomerId ?? null,
          },
        );

        return {
          params: {
            // Stripe rejects sessions that both pre-apply a discount and show
            // the promotion code field, so emailed offers skip the field.
            // Skipping payment details when the total is $0 keeps the free
            // offer to a single confirmation step.
            ...(recipientPromotionCodeId
              ? { discounts: [{ promotion_code: recipientPromotionCodeId }] }
              : { allow_promotion_codes: true }),
            branding_settings: getStripeCheckoutBrandingSettings(siteUrl),
            payment_method_collection: "if_required",
            submit_type: "subscribe",
          },
        };
      },
      plans: [
        {
          name: INSIDE_LAB_PLAN_NAME,
          priceId: getAuthEnvironment(ctx, "STRIPE_INSIDE_LAB_PRICE_ID"),
        },
      ],
    },
  });

  // Retain Better Auth's signature verification and public route, but disable
  // its webhook subscription writes: those trust stale event snapshots and
  // swallow callback failures. onEvent failures return a retryable non-2xx.
  const webhook = stripe({
    onEvent: (event) => fulfillStripeEvent(ctx, stripeClient, event),
    stripeClient,
    stripeWebhookSecret,
  });

  return {
    ...plugin,
    endpoints: {
      ...plugin.endpoints,
      stripeWebhook: webhook.endpoints.stripeWebhook,
    },
  };
}
