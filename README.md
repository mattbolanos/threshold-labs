Prototype for a friend. A platform for HYROX coaches to share workout details with athletes.

## Passwordless email sign-in

Email accounts sign in with a six-digit one-time code delivered through Resend.
Codes expire after five minutes; no password is collected or accepted. Google
accounts continue to use the verified-email claim supplied by Google.

Set these variables in each Convex deployment before enabling email sign-in:

```sh
bunx convex env set RESEND_API_KEY re_your_api_key
bunx convex env set AUTH_EMAIL_FROM "Threshold Lab <accounts@your-verified-domain.com>"
```

The sender address must use a domain verified in Resend. Add `--prod` when
configuring the production Convex deployment.

## Production auth and billing

Set the following variables on the production Convex deployment before the
first production build:

```sh
bunx convex env set --prod BETTER_AUTH_SECRET
bunx convex env set --prod SITE_URL https://your-production-domain.com
bunx convex env set --prod GOOGLE_CLIENT_ID
bunx convex env set --prod GOOGLE_CLIENT_SECRET
bunx convex env set --prod RESEND_API_KEY
bunx convex env set --prod AUTH_EMAIL_FROM "Threshold Lab <accounts@your-verified-domain.com>"
bunx convex env set --prod STRIPE_SECRET_KEY
bunx convex env set --prod STRIPE_WEBHOOK_SECRET
bunx convex env set --prod STRIPE_INSIDE_LAB_PRICE_ID
bunx convex env set --prod STRIPE_TRAINING_BLOCK_PRICE_ID
bunx convex env set --prod STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID
```

Use live-mode Stripe values together: `sk_live_...`, the live recurring
membership `price_...`, the live $100 one-time training-block `price_...`, the
live $400 one-time all-blocks `price_...`, and the signing secret for the live
webhook endpoint at
`https://your-production-domain.com/api/auth/stripe/webhook`. Subscribe that
endpoint to `checkout.session.completed`, `customer.subscription.created`,
`customer.subscription.updated`, and `customer.subscription.deleted`.

Each Stripe subscription owns one training-data window in the
`membershipAccessWindows` table. The window opens on the matching calendar date
one month before that subscription's checkout (for example, September 3 opens
August 3), extends forward while the subscription stays active, and closes on
the day the subscription stops being active (the earlier of the cancellation
and the paid-through date). Renewals never move a window. A member who cancels
and later subscribes again receives a new window for the new subscription plus
their earlier closed windows, but never the lapsed period in between. The
webhook handlers keep the windows in sync; subscriptions that predate the table
fall back to the Better Auth record's creation and end dates.

### Training block purchases

Training blocks are sold as one-time Stripe payments, with or without a
membership: $100 for a single block once it has started (start date on or
before today in Eastern time, so the in-progress block is included and shows
the workouts published so far), or $400 for every completed block (end date
before today) that exists at purchase time. Each purchase
is a `checkout.session.completed` payment-mode session created by
`trainingBlockPurchases.createCheckout`; the block id and purchase type travel
in the session metadata. The webhook handler and the success page both verify
the session (configured price, exact USD amount, paid status, purchasing user)
and then write one `trainingBlockPurchases` row per granted block, snapshotting
the block's dates and title. Blocks already owned are skipped, and the checkout
session id keeps the grant idempotent.

Purchased blocks grant Training and Workout Library access for their date
ranges indefinitely. Lab Notes, races, and training block context are available
to anyone who has paid, whether through an active membership or any past block
purchase. The active membership only adds ongoing workouts on top. Because Stripe Checkout shows the price's product name, a single
block checkout reads "Training Block" rather than the block title.

Configure the Stripe Customer Portal in live mode and enable payment-method
updates, invoice history, and subscription cancellation. Members open that
portal from **Access & billing** in their account menu.

### Member discount codes

Administrators can generate promotion codes from **Users & access** to copy
manually, or generate and deliver a code to an email address through Resend.
Recipients do not need an account before the code is sent. Each code is a bearer
token with a one-redemption limit, so the first eligible Stripe customer to
redeem it receives the offer. Members enter the code in Stripe Checkout; Better
Auth remains the source of truth for the resulting subscription and access
state.

Two forever-duration offers are supported:

- **$50/month** reads `STRIPE_INSIDE_LAB_PRICE_ID` and creates an amount-off
  coupon for the difference between that monthly USD price and $50.
- **Free forever** creates a 100% off coupon for the configured membership
  product. Checkout only asks for a payment method when an amount is due, so a
  fully discounted subscription does not require a card.

The shared coupons do not have global redemption caps. The one-use limit belongs
to each unique promotion code, so issuing a code does not consume availability
for other members. A forever discount remains on the subscription it was
redeemed against; if that subscription ends, the spent code does not transfer to
a later subscription automatically. The admin ledger keeps the optional
delivery address separate from the Stripe customer email that actually redeemed
the code. An administrator can revoke an active, unused code; redeemed codes are
retained as immutable history.

Set `CONVEX_DEPLOY_KEY` in the Vercel production environment. The custom build
command injects `NEXT_PUBLIC_CONVEX_URL`; set `NEXT_PUBLIC_CONVEX_SITE_URL` only
when the HTTP Actions URL cannot be derived from the standard `.convex.cloud`
deployment URL.

## Stripe preview environment

Every Vercel build of the `stripe` branch syncs the branch's Vercel Preview
environment into the `stripe` Convex preview before building the site. Configure
these variables in Vercel's Preview environment and scope them to the `stripe`
branch:

```text
AUTH_EMAIL_FROM
BETTER_AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
RESEND_API_KEY
STRIPE_INSIDE_LAB_PRICE_ID
STRIPE_SECRET_KEY
STRIPE_TRAINING_BLOCK_BUNDLE_PRICE_ID
STRIPE_TRAINING_BLOCK_PRICE_ID
STRIPE_WEBHOOK_SECRET
```

`CONVEX_DEPLOY_KEY` must also be a Convex preview deploy key. `SITE_URL` is set
automatically from Vercel's stable branch URL, and `PREVIEW_AUTH_BYPASS` defaults
to `true` unless the Vercel Preview environment explicitly sets it to `false`.
The sync is atomic and fails the deployment if a required variable is missing.
It also rejects live-mode Stripe secret keys; use one coherent set of Stripe
test-mode credentials and prices for the preview. Keep Vercel's **Automatically
expose System Environment Variables** project setting enabled so the branch name
and branch URL are available during the build.

For a new deployment, temporarily set the first verified administrator email
before that account signs up:

```sh
bunx convex env set --prod AUTH_BOOTSTRAP_ADMIN_EMAIL admin@example.com
```

Remove `AUTH_BOOTSTRAP_ADMIN_EMAIL` after the account has been created. Never
set `PREVIEW_AUTH_BYPASS=true` on the production Convex deployment; it disables
both membership and administrator authorization checks.
