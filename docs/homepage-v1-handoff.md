# Threshold Lab homepage v1

This mockup brings the public `thresholdlab.co` visual language into the member application while keeping the member experience intact.

## Page structure

1. Capsule navigation with public anchors, sign-in, and a primary offer CTA
2. Coaching-led hero with performance proof
3. Three compact offer cards
4. Inside the Lab beta preview
5. Founder and coaching section
6. Compact testimonials with expandable quotes
7. Partnership strip
8. Minimal social footer

The newsletter and Store have intentionally been removed from the homepage and navigation.

## Offer positioning

- **1:1 Coaching — Built for you:** individualized programming and direct coaching
- **App Membership — The plan:** structured programs and community support
- **Inside the Lab — The process:** Lab Notes, training visibility, and performance trends

Inside the Lab is deliberately shown as a separate beta product. Its current CTA opens a Google Form for early-access applications; entitlement and payment work are outside this design pass.

## Routing changes in this mockup

- `/` is now the public homepage.
- The existing member feed moved to `/lab-notes`.
- Login and signup callbacks now return members to `/lab-notes`.
- The member navigation logo now links to `/lab-notes`.

## Implementation map

- `src/app/page.tsx`: page composition
- `src/components/marketing/`: homepage blocks
- `src/lib/marketing-content.ts`: offer, navigation, and testimonial content
- `src/components/site-shell.tsx`: public versus member presentation
- `public/marketing/`: optimized assets sourced from `threshold-lab-website`

The partnership strip currently links to the existing live partnership page. It can point to the consolidated route when that page is migrated.

## Inside the Lab integration decision

This is the recommended routing and access model for the implementation PR. It is not part of the current marketing-page pass.

- Keep the public site and member product in this repository, deployment, and domain.
- `/` always renders the public marketing homepage, regardless of login state.
- `/inside` is the member gateway. Logged-out users go to login, authorized users go to `/inside/lab-notes`, and authenticated users without access see an access-required state.
- Place member features beneath the `/inside` namespace, beginning with `/inside/lab-notes` and `/inside/training`.
- Use the current member application navbar inside this area, with Lab Notes and Training as sub-navigation and room for future tabs.
- Keep Lab Notes as the default destination after a successful login.
- Add an explicit Inside the Lab entitlement rather than inferring product access from the existing client, coach, or admin role.
- Enforce the entitlement in both the Next.js member layout and protected Convex queries; hiding navigation links alone is not sufficient paywall protection.
