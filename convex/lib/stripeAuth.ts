import { stripe } from "@better-auth/stripe";
import type { GenericCtx } from "@convex-dev/better-auth";
import Stripe from "stripe";
import type { DataModel } from "../_generated/dataModel";
import { getAuthEnvironment } from "./authEnvironment";

const STRIPE_API_VERSION = "2026-07-29.dahlia";

export function createStripeAuthPlugin(ctx: GenericCtx<DataModel>) {
  const stripeClient = new Stripe(
    getAuthEnvironment(ctx, "STRIPE_SECRET_KEY"),
    {
      apiVersion: STRIPE_API_VERSION,
      httpClient: Stripe.createFetchHttpClient(),
    },
  );

  return stripe({
    createCustomerOnSignUp: true,
    stripeClient,
    stripeWebhookSecret: getAuthEnvironment(ctx, "STRIPE_WEBHOOK_SECRET"),
  });
}
