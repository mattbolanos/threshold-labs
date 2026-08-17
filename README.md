Prototype for a friend. A platform for HYROX coaches to share workout details with athletes.

## Email verification

Password accounts must verify their email before signing in. Verification links
are delivered through Resend and expire after one hour. Google accounts use the
verified-email claim supplied by Google and do not enter this flow.

Set these variables in each Convex deployment before enabling password signups:

```sh
bunx convex env set RESEND_API_KEY re_your_api_key
bunx convex env set AUTH_EMAIL_FROM "Threshold Lab <accounts@your-verified-domain.com>"
```

The sender address must use a domain verified in Resend. Add `--prod` when
configuring the production Convex deployment.
