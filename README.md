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
```

Use live-mode Stripe values together: `sk_live_...`, the live recurring
`price_...`, and the signing secret for the live webhook endpoint at
`https://your-production-domain.com/api/auth/stripe/webhook`. Subscribe that
endpoint to `checkout.session.completed`, `customer.subscription.created`,
`customer.subscription.updated`, and `customer.subscription.deleted`.

Set `CONVEX_DEPLOY_KEY` in the Vercel production environment. The custom build
command injects `NEXT_PUBLIC_CONVEX_URL`; set `NEXT_PUBLIC_CONVEX_SITE_URL` only
when the HTTP Actions URL cannot be derived from the standard `.convex.cloud`
deployment URL.

For a new deployment, temporarily set the first verified administrator email
before that account signs up:

```sh
bunx convex env set --prod AUTH_BOOTSTRAP_ADMIN_EMAIL admin@example.com
```

Remove `AUTH_BOOTSTRAP_ADMIN_EMAIL` after the account has been created. Never
set `PREVIEW_AUTH_BYPASS=true` on the production Convex deployment; it disables
both membership and administrator authorization checks.
