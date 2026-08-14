import { stripe } from "@better-auth/stripe";
import type { GenericCtx } from "@convex-dev/better-auth";
import Stripe from "stripe";
import type { DataModel } from "../_generated/dataModel";
import { getAuthEnvironment } from "./authEnvironment";

const STRIPE_API_VERSION = "2026-07-29.dahlia";
const INSIDE_LAB_PLAN_NAME = "inside-the-lab";

function createStripeClient(ctx: GenericCtx<DataModel>) {
  return new Stripe(getAuthEnvironment(ctx, "STRIPE_SECRET_KEY"), {
    apiVersion: STRIPE_API_VERSION,
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function createStripeAuthPlugin(ctx: GenericCtx<DataModel>) {
  const siteUrl = getAuthEnvironment(ctx, "SITE_URL");

  return stripe({
    createCustomerOnSignUp: false,
    stripeClient: createStripeClient(ctx),
    stripeWebhookSecret: getAuthEnvironment(ctx, "STRIPE_WEBHOOK_SECRET"),
    subscription: {
      enabled: true,
      getCheckoutSessionParams: () => ({
        params: {
          branding_settings: {
            background_color: "#030504",
            border_style: "rounded",
            button_color: "#7AF440",
            display_name: "Threshold Lab",
            font_family: "inter",
            icon: {
              type: "url",
              url: new URL("/web-app-manifest-512x512.png", siteUrl).toString(),
            },
          },
          submit_type: "subscribe",
        },
      }),
      plans: [
        {
          name: INSIDE_LAB_PLAN_NAME,
          priceId: getAuthEnvironment(ctx, "STRIPE_INSIDE_LAB_PRICE_ID"),
        },
      ],
    },
  });
}
