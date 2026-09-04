import type { DBAdapter } from "better-auth";
import Stripe from "stripe";

type CheckoutUser = {
  id: string;
  email: string;
  name?: string;
  stripeCustomerId?: string | null;
};

/** Repair a missing billing customer before either checkout uses its saved ID. */
export async function ensureStripeCustomer(
  stripeClient: Stripe,
  adapter: Pick<DBAdapter, "update" | "updateMany">,
  user: CheckoutUser,
) {
  const previousId = user.stripeCustomerId;
  if (previousId) {
    try {
      const customer = await stripeClient.customers.retrieve(previousId);
      if (!customer.deleted) return previousId;
    } catch (error) {
      // Authentication, connection, and rate-limit failures must not create
      // replacement customers. Only recover when Stripe confirms it is gone.
      if (
        !(error instanceof Stripe.errors.StripeInvalidRequestError) ||
        error.code !== "resource_missing" ||
        error.param !== "id"
      ) {
        throw error;
      }
    }
  }

  const customer = await stripeClient.customers.create(
    {
      email: user.email,
      ...(user.name ? { name: user.name } : {}),
      metadata: { customerType: "user", userId: user.id },
    },
    { idempotencyKey: `threshold-customer-${user.id}-${previousId ?? "new"}` },
  );

  // Update unfinished checkout records first, so retrying a failed write still
  // repairs them. Existing subscription history remains attached to its customer.
  if (previousId) {
    await adapter.updateMany({
      model: "subscription",
      update: { stripeCustomerId: customer.id },
      where: [
        { field: "referenceId", value: user.id },
        { field: "stripeCustomerId", value: previousId },
        { field: "status", value: "incomplete" },
      ],
    });
  }
  await adapter.update({
    model: "user",
    update: { stripeCustomerId: customer.id },
    where: [{ field: "id", value: user.id }],
  });
  return customer.id;
}
