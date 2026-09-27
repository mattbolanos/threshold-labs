# Membership landing mockups

Branch: `design/membership-landing-mockups`

## Review routes

- `/`: homepage with the original hero and updated 200+ athlete count, side-by-side membership cards, followed by the original founder/coaching block and scrolling client reviews. The training-week preview appears only on the Inside the Lab page.
- `/inside-the-lab`: public product/pricing page for social links. Leads with the $70/month membership, then prominently offers all current training blocks as a one-time purchase. The bundle callout reads the configured price through the existing server helper and links to `/subscribe?view=all`. The page then explains ongoing value, shows the existing sample week, and answers purchase questions.
- `/lab/pricing`: existing authenticated purchasing page, with a clearer product introduction and a link to the public explanation.

The public sales page is deliberately outside `/lab`: the existing lab layout requires authentication. Checkout, discounts, historical ownership, and membership entitlement rules are unchanged. The membership CTA uses the existing `/subscribe?purchase=membership` flow. The app CTA uses the existing Everfit product URL.

## Positioning

**Threshold Lab App — a plan for your training.** Structured programs, community, and office hours at the existing $40/month price.

**Inside the Lab — a window into Stephen’s training.** Training data, analysis, race decisions, and Lab Notes at the existing $70/month price. This is not a personalized prescription. Each membership is purchased separately.

The original founder/coaching block and client review carousel sit below the product sections. The reviews retain their original quotes and program labels, presenting Stephen’s broader coaching reputation. Historical training blocks no longer appear as a fourth homepage product. Josh’s standalone app review is hidden for now; its component is retained for possible reuse, and his original carousel review remains. The homepage now references 200+ athletes coached.

## References and rationale

- [Runna](https://www.runna.com/): clear audience/goal framing and visible product explanation. Applied here in the two membership cards.
- [Ladder](https://www.joinladder.com/): concrete programming, coaching, and community benefits. Applied as specific inclusions rather than an abstract membership pitch.
- [TrainerRoad](https://www.trainerroad.com/): explain how the product works alongside its outcome. Applied as sessions → decisions → ongoing changes.

These are qualitative design references, not evidence that this layout will improve conversion. Keep the established dark/lime palette, rounded cards, existing photography, and actual interactive preview.

## Copy and release notes

Prices and product inclusions come from current repository content and the linked strategy thread. The sample week remains the existing curated preview, with its actual dates; it is not labeled as current training. No fabricated member reviews, scarcity counters, trial offers, or performance promises were added.

Before release, review copy and mobile/desktop presentation. Useful future measurements are product CTA clicks, checkout starts, and completed purchases by acquisition source. This branch adds no new analytics integration or publishing step.

## Stripe and access review

- No changes to Convex functions, schemas, Stripe SDK calls, webhooks, price IDs, auth callbacks, discounts, billing settings, or entitlement checks.
- Monthly CTAs use the existing `/subscribe?purchase=membership` flow. Logged-out visitors continue through signup with their purchase selection preserved.
- The historical bundle CTA opens `/subscribe?view=all` to review existing purchase options; it does not trigger a payment itself.
- The bundle display uses `getTrainingBlockBundlePrice()` through the existing `BundlePriceDetail` server component inside Suspense. Its price comes from the same configured source used by checkout, not a hardcoded $400/$500. Stripe remains authoritative for the eventual charge.
- `/inside-the-lab` is the only added public route. All existing `/lab` authentication and paid-access checks remain in place.
- `LOCAL_DEV_ORIGIN` optionally permits a specific LAN hostname for Next.js development assets. It does not change production CORS or Stripe configuration. No deployment environment changes are required.

## Validation — September 27, 2026

- `bun --no-env-file test ./src ./convex`: **216 passed, 0 failed**, across 32 files. Covers checkout return routing, membership access, bundle pricing, historical purchases, discounts, and Stripe webhook/fulfillment logic.
- Production `bun --no-env-file run build` with the documented preview Convex URLs: passed using Turbopack, including TypeScript and all 36 generated pages. The initial sandboxed attempt could not download Google Fonts; the network-enabled build passed.
- Biome checks on changed source files and `git diff --check`: passed.
- The user reviewed the local mockups. No automated browser interaction test or real/test-card Stripe transaction was performed.

## Engineer handoff before merge

1. Review desktop/mobile layout, carousel arrow/scroll behavior, and expanding all eight original quotes.
2. On the preview deployment, check the monthly CTA signed out and signed in, including an existing member and an invited/discounted account.
3. Check the bundle CTA reaches the full catalog, the displayed bundle price matches its configured value, and existing block ownership is preserved.
4. Run a Stripe test-mode purchase/cancellation/webhook smoke test if required by your release process. Automated regression tests do not verify live credentials or webhook delivery.
5. A pre-existing development warning was observed on `/partnerships`: its async `MarketingHeader` is not locally wrapped in Suspense. That page is unchanged and the production build passes; review separately if the warning persists.

The branch includes a dormant `AppProofSection` component for the standalone Josh review, retained at the user's request for possible reuse. It is not rendered. No PR merge or production deployment is part of this handoff.
