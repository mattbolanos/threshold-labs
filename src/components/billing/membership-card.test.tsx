import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MembershipCard } from "./membership-card";

describe("MembershipCard", () => {
  test("offers Stripe billing management for an active subscription", () => {
    const markup = renderToStaticMarkup(
      <MembershipCard
        accessSource="subscription"
        hasBillingAccount={true}
        subscription={{
          cancelAt: null,
          cancelAtPeriodEnd: false,
          periodEnd: Date.UTC(2026, 8, 24),
          status: "active",
        }}
      />,
    );

    expect(markup.match(/Inside the Lab membership/g)).toHaveLength(1);
    expect(markup).toContain("Active");
    expect(markup).toContain("Renews");
    expect(markup).toContain("Sep 24, 2026");
    expect(markup).toContain("$70/month");
    expect(markup).toContain("Manage billing in Stripe");
    expect(markup).toContain("payment methods, invoices, and cancellation");
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
      />,
    );

    expect(markup).toContain("Cancellation scheduled");
    expect(markup).toContain("Access until");
    expect(markup).toContain("Sep 24, 2026");
    expect(markup).toContain("charged again.");
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
      />,
    );

    expect(markup).toContain("Canceled");
    expect(markup).toContain("Ended");
    expect(markup).toContain("Aug 24, 2026");
    expect(markup).toContain("Manage billing in Stripe");
  });

  test("points an account without Stripe billing toward checkout", () => {
    const markup = renderToStaticMarkup(
      <MembershipCard
        accessSource="none"
        hasBillingAccount={false}
        subscription={null}
      />,
    );

    expect(markup).toContain("No active membership");
    expect(markup).toContain('href="/subscribe"');
    expect(markup).toContain("Start membership");
    expect(markup).not.toContain("Manage billing in Stripe");
  });

  test("keeps live billing actions out of preview mode", () => {
    const markup = renderToStaticMarkup(
      <MembershipCard
        accessSource="preview"
        hasBillingAccount={false}
        subscription={null}
      />,
    );

    expect(markup).toContain("Preview access");
    expect(markup).toContain(
      "Preview mode does not connect to a live Stripe customer.",
    );
    expect(markup).not.toContain("Manage billing in Stripe");
    expect(markup).not.toContain("Start membership");
  });
});
