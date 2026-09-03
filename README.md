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
bunx convex env set --prod STRIPE_TRAINING_ARCHIVE_PRICE_ID
```

Use live-mode Stripe values together: `sk_live_...`, the live recurring
membership `price_...`, the live $400 one-time complete-history `price_...`,
and the signing secret for the live webhook endpoint at
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
fall back to the Better Auth record's creation and end dates. A new
complete-history purchase is checked out with the recurring membership in the
same Stripe session: $400 once plus $70/month. An existing active member can add
history for the one-time $400 payment without starting a second subscription.

The history purchase grants Training and Workout Library access from September
1, 2025 through the purchase date and remains available if the monthly
membership later ends. The active membership adds ongoing training data and Lab
Notes. The checkout verifier requires the configured history price, the
configured recurring membership price for new bundle purchases, a paid USD
session, and the purchasing user reference before it records history access.

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
STRIPE_TRAINING_ARCHIVE_PRICE_ID
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
