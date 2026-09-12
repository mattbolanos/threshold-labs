import Stripe from "stripe";

const description =
  "Stephen’s training log from 30 days before you join, plus new workouts as they are published while your membership is active. Includes session details, workout notes, training trends, and Lab Notes.";
const secretKey = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_INSIDE_LAB_PRICE_ID;

if (!secretKey || !priceId) {
  throw new Error(
    "Set STRIPE_SECRET_KEY and STRIPE_INSIDE_LAB_PRICE_ID for the deployment you want to update.",
  );
}

const stripe = new Stripe(secretKey);
const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
if (
  price.currency !== "usd" ||
  price.unit_amount !== 7000 ||
  price.recurring?.interval !== "month" ||
  price.recurring.interval_count !== 1
) {
  throw new Error("The configured price must be the $70/month USD membership.");
}
const product = price.product;
if (typeof product === "string" || product.deleted)
  throw new Error("The membership product could not be loaded.");

process.stdout.write(
  `${JSON.stringify({ currentDescription: product.description, mode: price.livemode ? "live" : "test", newDescription: description, product: product.name }, null, 2)}\n`,
);
if (process.argv.includes("--apply")) {
  await stripe.products.update(product.id, { description });
  const updated = await stripe.products.retrieve(product.id);
  if (updated.description !== description)
    throw new Error("Stripe did not save the requested description.");
  process.stdout.write(
    "Membership product description updated and verified.\n",
  );
} else {
  process.stdout.write(
    "Preview only. Run again with --apply to save this description.\n",
  );
}
