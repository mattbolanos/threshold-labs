import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MembershipCard } from "./membership-card";

describe("MembershipCard", () => {
  test("shows the current payment and cancellation for an active subscription", () => {
    const markup = renderToStaticMarkup(
      <MembershipCard
        accessSource="subscription"
        hasBillingAccount={true}
        subscription={{
          accessStart: "2026-07-05",
          billing: {
            amount: 5_000,
            currency: "usd",
            interval: "month",
            intervalCount: 1,
          },
          cancelAt: null,
          cancelAtPeriodEnd: false,
          periodEnd: Date.UTC(2026, 8, 24),
          status: "active",
        }}
        trainingBlocks={null}
      />,
    );

    expect(markup.match(/Inside the Lab membership/g)).toHaveLength(1);
    expect(markup).toContain("Active");
    expect(markup).toContain("Renews");
    expect(markup).toContain("Sep 24, 2026");
    expect(markup).toContain("$50/month");
    expect(markup).not.toContain("$70/month");
    expect(markup).toContain("You pay");
    expect(markup).toContain("Training data from");
    expect(markup).toContain("Jul 5, 2026");
    expect(markup).toContain("Payment &amp; invoices");
    expect(markup).toContain("Cancel membership");
    expect(markup).toContain("ask you to confirm cancellation");
  });

  test("makes a scheduled cancellation and remaining access explicit", () => {
    const markup = renderToStaticMarkup(
      <MembershipCard
        accessSource="subscription"
        hasBillingAccount={true}
        subscription={{
          cancelAt: Date.UTC(2026, 8, 24),
          cancelAtPeriodEnd: false,
          periodEnd: Date.UTC(2026, 8, 24),
          status: "active",
        }}
        trainingBlocks={null}
      />,
    );

    expect(markup).toContain("Cancellation scheduled");
    expect(markup).toContain("Access until");
    expect(markup).toContain("Sep 24, 2026");
    expect(markup).toContain("charged again.");
    expect(markup).not.toContain("Cancel membership");
  });

  test("shows when a membership has already ended", () => {
    const markup = renderToStaticMarkup(
      <MembershipCard
        accessSource="none"
        hasBillingAccount={true}
        subscription={{
          cancelAt: null,
          cancelAtPeriodEnd: false,
          periodEnd: Date.UTC(2026, 7, 24),
          status: "canceled",
        }}
        trainingBlocks={null}
      />,
    );

    expect(markup).toContain("Canceled");
    expect(markup).toContain("Ended");
    expect(markup).toContain("Aug 24, 2026");
    expect(markup).toContain("Payment &amp; invoices");
    expect(markup).not.toContain("Cancel membership");
  });

  test("shows when an account has not purchased access", () => {
    const markup = renderToStaticMarkup(
      <MembershipCard
        accessSource="none"
        hasBillingAccount={false}
        subscription={null}
        trainingBlocks={null}
      />,
    );

    expect(markup).toContain("No active access");
    expect(markup).toContain("View plans");
    expect(markup).not.toContain("Payment &amp; invoices");
    expect(markup).not.toContain("Cancel membership");
  });

  test("keeps live billing actions out of preview mode", () => {
    const markup = renderToStaticMarkup(
      <MembershipCard
        accessSource="preview"
        hasBillingAccount={false}
        subscription={null}
        trainingBlocks={null}
      />,
    );

    expect(markup).toContain("Preview access");
    expect(markup).toContain(
      "Preview access shows the full product experience without connecting to a live Stripe customer.",
    );
    expect(markup).not.toContain("Payment &amp; invoices");
    expect(markup).not.toContain("Cancel membership");
    expect(markup).not.toContain("Start membership");
  });

  test("shows a representative paid state without enabling preview billing actions", () => {
    const markup = renderToStaticMarkup(
      <MembershipCard
        accessSource="preview"
        hasBillingAccount={true}
        isBillingPreview={true}
        subscription={{
          billing: {
            amount: 5_000,
            currency: "usd",
            interval: "month",
            intervalCount: 1,
          },
          cancelAt: null,
          cancelAtPeriodEnd: false,
          periodEnd: Date.UTC(2026, 9, 3),
          status: "active",
        }}
        trainingBlocks={null}
      />,
    );

    expect(markup).toContain("Inside the Lab membership");
    expect(markup).toContain("$50/month");
    expect(markup).toContain("Cancel membership");
    expect(markup).toContain("disabled");
    expect(markup).not.toContain("Preview access");
  });

  test("lists earlier membership windows without the lapsed period", () => {
    const markup = renderToStaticMarkup(
      <MembershipCard
        accessSource="subscription"
        hasBillingAccount={true}
        subscription={{
          accessStart: "2026-12-16",
          cancelAt: null,
          cancelAtPeriodEnd: false,
          pastAccessWindows: [{ from: "2026-05-03", to: "2026-08-03" }],
          periodEnd: Date.UTC(2027, 1, 16),
          status: "active",
        }}
        trainingBlocks={null}
      />,
    );

    expect(markup).toContain("Training data from");
    expect(markup).toContain("Dec 16, 2026");
    expect(markup).toContain("Earlier membership data");
    expect(markup).toContain("May 3, 2026 – Aug 3, 2026");
  });

  const purchasedBlocks = {
    purchases: [
      {
        accessEnd: "2025-11-23",
        accessStart: "2025-10-13",
        purchasedAt: Date.UTC(2026, 8, 3),
        title: "Strength Capacity",
        trainingBlockId: "block_2",
      },
      {
        accessEnd: "2025-10-12",
        accessStart: "2025-09-01",
        purchasedAt: Date.UTC(2026, 8, 3),
        title: "Aerobic Foundation",
        trainingBlockId: "block_1",
      },
    ],
    windows: [{ from: "2025-09-01", to: "2025-11-23" }],
  };

  test("lists purchased training blocks without a membership", () => {
    const markup = renderToStaticMarkup(
      <MembershipCard
        accessSource="training_blocks"
        hasBillingAccount={false}
        subscription={null}
        trainingBlocks={purchasedBlocks}
      />,
    );

    expect(markup).toContain("Training blocks");
    expect(markup).toContain("2 blocks purchased");
    expect(markup).toContain("Aerobic Foundation");
    expect(markup).toContain("Sep 1, 2025 – Oct 12, 2025");
    expect(markup).toContain("Strength Capacity");
    expect(markup).toContain("Oct 13, 2025 – Nov 23, 2025");
    expect(markup).toContain(
      "monthly membership adds new workouts as they are published",
    );
    expect(markup).not.toContain("Cancel membership");
  });

  test("shows both entitlements when a member also owns blocks", () => {
    const markup = renderToStaticMarkup(
      <MembershipCard
        accessSource="subscription"
        hasBillingAccount={true}
        subscription={{
          cancelAt: null,
          cancelAtPeriodEnd: false,
          periodEnd: Date.UTC(2026, 9, 3),
          status: "active",
        }}
        trainingBlocks={purchasedBlocks}
      />,
    );

    expect(markup).toContain("Inside the Lab membership");
    expect(markup).toContain("Training blocks");
    expect(markup).toContain("2 blocks purchased");
    expect(markup).toContain("Aerobic Foundation");
    expect(markup).toContain("Payment &amp; invoices");
    expect(markup).toContain("Cancel membership");
  });
});
