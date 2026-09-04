import { stripe } from "@better-auth/stripe";
import type { GenericCtx } from "@convex-dev/better-auth";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import Stripe from "stripe";
import { internal } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import { getAuthEnvironment } from "./authEnvironment";
import { ensureRecipientPromotionCode } from "./discountCheckout";
import { INSIDE_LAB_PLAN_NAME } from "./labAccess";
import { ensureStripeCustomer } from "./stripeCustomer";
import { getVerifiedTrainingBlockPurchase } from "./trainingBlockStripe";

const STRIPE_API_VERSION = "2026-07-29.dahlia";

async function syncMembershipAccessWindow(
  ctx: GenericCtx<DataModel>,
  event: Stripe.Event,
  stripeSubscription: Stripe.Subscription,
  referenceId: string,
) {
  if (!("runMutation" in ctx)) {
    return;
  }

  const periodEnd = stripeSubscription.items.data[0]?.current_period_end;

  await ctx.runMutation(
    internal.subscriptionAccess.syncMembershipAccessWindow,
    {
      observedAt: event.created * 1_000,
      periodEnd: periodEnd ? periodEnd * 1_000 : undefined,
      referenceId,
      startedAt: stripeSubscription.created * 1_000,
      status: stripeSubscription.status,
      stripeSubscriptionId: stripeSubscription.id,
    },
  );
}

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

async function getRedemptionIdentity({
  checkoutSession,
  stripeClient,
  stripeSubscription,
}: {
  checkoutSession: Stripe.Checkout.Session;
  stripeClient: Stripe;
  stripeSubscription: Stripe.Subscription;
}) {
  const stripeCustomerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer.id;
  let redeemedByEmail =
    checkoutSession.customer_details?.email?.trim().toLowerCase() ?? undefined;

  if (!redeemedByEmail) {
    try {
      const customer = await stripeClient.customers.retrieve(stripeCustomerId);
      if (!customer.deleted) {
        redeemedByEmail = customer.email?.trim().toLowerCase() ?? undefined;
      }
    } catch {
      // Redemption is still recorded if Stripe customer lookup is unavailable.
    }
  }

  return { redeemedByEmail, stripeCustomerId };
}

export function createStripeAuthPlugin(ctx: GenericCtx<DataModel>) {
  const siteUrl = getAuthEnvironment(ctx, "SITE_URL");
  const stripeClient = createStripeClient(ctx);

  return stripe({
    createCustomerOnSignUp: false,
    onEvent: async (event) => {
      if (
        event.type !== "checkout.session.completed" ||
        !("runMutation" in ctx)
      ) {
        return;
      }

      const checkoutSession = event.data.object;
      const purchase = await getVerifiedTrainingBlockPurchase({
        checkoutSessionId: checkoutSession.id,
        ctx,
        stripeClient,
      });

      if (purchase) {
        await ctx.runMutation(internal.trainingBlockPurchases.grantPurchase, {
          purchase,
        });
      }
    },
    stripeClient,
    stripeWebhookSecret: getAuthEnvironment(ctx, "STRIPE_WEBHOOK_SECRET"),
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
      onSubscriptionComplete: async ({
        event,
        stripeSubscription,
        subscription,
      }) => {
        if (!("runMutation" in ctx)) {
          return;
        }

        await syncMembershipAccessWindow(
          ctx,
          event,
          stripeSubscription,
          subscription.referenceId,
        );

        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const expandedSubscription = await stripeClient.subscriptions.retrieve(
          stripeSubscription.id,
          { expand: ["discounts"] },
        );
        const stripePromotionCodeIds = expandedSubscription.discounts.flatMap(
          (discount) => {
            if (typeof discount === "string" || !discount.promotion_code) {
              return [];
            }

            return [
              typeof discount.promotion_code === "string"
                ? discount.promotion_code
                : discount.promotion_code.id,
            ];
          },
        );

        if (stripePromotionCodeIds.length > 0) {
          const { redeemedByEmail, stripeCustomerId } =
            await getRedemptionIdentity({
              checkoutSession,
              stripeClient,
              stripeSubscription: expandedSubscription,
            });
          await ctx.runMutation(
            internal.discountCodes.markDiscountCodesRedeemed,
            {
              redeemedAt: event.created * 1_000,
              redeemedByEmail,
              stripeCustomerId,
              stripePromotionCodeIds,
              stripeSubscriptionId: expandedSubscription.id,
            },
          );
        }
      },
      onSubscriptionCreated: async ({
        event,
        stripeSubscription,
        subscription,
      }) => {
        await syncMembershipAccessWindow(
          ctx,
          event,
          stripeSubscription,
          subscription.referenceId,
        );
      },
      onSubscriptionDeleted: async ({
        event,
        stripeSubscription,
        subscription,
      }) => {
        await syncMembershipAccessWindow(
          ctx,
          event,
          stripeSubscription,
          subscription.referenceId,
        );
      },
      onSubscriptionUpdate: async ({
        event,
        stripeSubscription,
        subscription,
      }) => {
        await syncMembershipAccessWindow(
          ctx,
          event,
          stripeSubscription,
          subscription.referenceId,
        );
      },
      plans: [
        {
          name: INSIDE_LAB_PLAN_NAME,
          priceId: getAuthEnvironment(ctx, "STRIPE_INSIDE_LAB_PRICE_ID"),
        },
      ],
    },
  });
}
