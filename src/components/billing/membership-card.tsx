import Link from "next/link";
import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getMembershipStatusDetails,
  insideLabMembership,
  type MembershipSubscription,
} from "@/lib/billing";

interface MembershipCardProps {
  accessSource: "admin" | "none" | "preview" | "subscription";
  hasBillingAccount: boolean;
  subscription: MembershipSubscription | null;
}

export function MembershipCard({
  accessSource,
  hasBillingAccount,
  subscription,
}: MembershipCardProps) {
  const statusDetails = subscription
    ? getMembershipStatusDetails(subscription)
    : null;
  const title = subscription
    ? insideLabMembership.title
    : accessSource === "admin"
      ? "Administrator access"
      : accessSource === "preview"
        ? "Preview access"
        : "No active membership";
  const description = statusDetails
    ? statusDetails.description
    : accessSource === "admin"
      ? "Your administrator role includes access without a paid membership."
      : accessSource === "preview"
        ? "Billing actions are unavailable while preview access is enabled."
        : hasBillingAccount
          ? "Your membership is not currently active."
          : "Start a membership to access Inside the Lab.";

  return (
    <Card className="max-w-2xl shadow-sm">
      <CardHeader className="has-data-[slot=card-action]:grid-cols-1 sm:has-data-[slot=card-action]:grid-cols-[1fr_auto]">
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        <CardDescription className="row-start-3 mt-2 leading-relaxed text-pretty sm:col-start-1 sm:row-start-2 sm:mt-0">
          {description}
        </CardDescription>
        {statusDetails ? (
          <CardAction className="col-start-1 row-span-1 row-start-2 mt-1 justify-self-start sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0 sm:justify-self-end">
            <Badge variant={statusDetails.badgeVariant}>
              {statusDetails.badgeLabel}
            </Badge>
          </CardAction>
        ) : null}
      </CardHeader>

      {subscription && statusDetails ? (
        <CardContent>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Billing
              </dt>
              <dd className="text-base font-medium tabular-nums">
                {insideLabMembership.priceLabel}
              </dd>
            </div>
            {statusDetails.periodLabel && statusDetails.periodValue ? (
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {statusDetails.periodLabel}
                </dt>
                <dd className="text-base font-medium tabular-nums">
                  {statusDetails.periodValue}
                </dd>
              </div>
            ) : null}
          </dl>
        </CardContent>
      ) : (
        <CardContent>
          <p className="max-w-xl leading-relaxed text-pretty text-muted-foreground">
            {accessSource === "preview"
              ? "Preview mode does not connect to a live Stripe customer."
              : hasBillingAccount
                ? "You can still open Stripe to review billing history or manage an existing subscription."
                : "No Stripe billing account is connected to this profile."}
          </p>
        </CardContent>
      )}

      {hasBillingAccount ? (
        <CardFooter className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-xs leading-relaxed text-pretty text-muted-foreground">
            Stripe securely handles payment methods, invoices, and cancellation.
          </p>
          <BillingPortalButton />
        </CardFooter>
      ) : accessSource === "none" ? (
        <CardFooter className="justify-end">
          <Link
            className={buttonVariants({
              className:
                "w-full motion-safe:transition-transform motion-safe:active:scale-96 sm:w-auto",
              size: "lg",
            })}
            href="/subscribe"
          >
            Start membership
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}
