import type { UrlObject } from "node:url";
import {
  IconArchive,
  IconEye,
  IconLock,
  IconLockOpen,
  IconShieldCheck,
} from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { CancelMembershipButton } from "@/components/billing/cancel-membership-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatTrainingAccessDate,
  formatTrainingAccessRange,
  getMembershipPriceLabel,
  getMembershipStatusDetails,
  getTrainingAccessLabel,
  insideLabMembership,
  type MembershipSubscription,
  type TrainingArchiveAccess,
  trainingArchivePass,
} from "@/lib/billing";

interface MembershipCardProps {
  accessSource:
    | "admin"
    | "none"
    | "preview"
    | "subscription"
    | "training_archive";
  hasBillingAccount: boolean;
  isBillingPreview?: boolean;
  plansHref?: Route | UrlObject;
  subscription: MembershipSubscription | null;
  trainingArchive: TrainingArchiveAccess | null;
}

interface AccessRowProps {
  badge: ReactNode;
  children?: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}

function AccessRow({
  badge,
  children,
  description,
  icon,
  title,
}: AccessRowProps) {
  return (
    <article className="flex gap-4 py-6 first:pt-0 last:pb-0">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold">{title}</h3>
          {badge}
        </div>
        <p className="mt-1 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {children}
      </div>
    </article>
  );
}

function AccessDetails({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div className="flex flex-col gap-1" key={item.label}>
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {item.label}
          </dt>
          <dd className="text-lg font-semibold tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function MembershipCard({
  accessSource,
  hasBillingAccount,
  isBillingPreview = false,
  plansHref = "/subscribe",
  subscription,
  trainingArchive,
}: MembershipCardProps) {
  const statusDetails = subscription
    ? getMembershipStatusDetails(subscription)
    : null;
  const isActiveSubscription =
    subscription?.status === "active" || subscription?.status === "trialing";
  const hasScheduledCancellation = Boolean(
    subscription?.cancelAtPeriodEnd || subscription?.cancelAt,
  );
  const hasAccessRows =
    subscription !== null ||
    trainingArchive !== null ||
    accessSource === "admin" ||
    accessSource === "preview";

  return (
    <Card className="bg-card/75 shadow-sm shadow-black/20">
      <CardHeader>
        <CardTitle>
          <h2 className="text-xl font-semibold tracking-tight">
            Current billing
          </h2>
        </CardTitle>
        <CardDescription className="text-pretty leading-relaxed">
          What you pay for and when your plan renews.
        </CardDescription>
      </CardHeader>

      <CardContent className="divide-y divide-border/70">
        {subscription && statusDetails ? (
          <AccessRow
            badge={
              <Badge variant={statusDetails.badgeVariant}>
                {statusDetails.badgeLabel}
              </Badge>
            }
            description={statusDetails.description}
            icon={<IconLock aria-hidden className="size-5" stroke={2} />}
            title={insideLabMembership.title}
          >
            <AccessDetails
              items={[
                {
                  label:
                    isActiveSubscription && !hasScheduledCancellation
                      ? "You pay"
                      : "Plan price",
                  value: getMembershipPriceLabel(subscription),
                },
                ...(statusDetails.periodLabel && statusDetails.periodValue
                  ? [
                      {
                        label: statusDetails.periodLabel,
                        value: statusDetails.periodValue,
                      },
                    ]
                  : []),
                ...(isActiveSubscription && subscription.accessStart
                  ? [
                      {
                        label: "Training data from",
                        value: formatTrainingAccessDate(
                          subscription.accessStart,
                        ),
                      },
                    ]
                  : []),
                ...(isActiveSubscription
                  ? (subscription.pastAccessWindows ?? []).map((window) => ({
                      label: "Earlier membership data",
                      value: formatTrainingAccessRange(window.from, window.to),
                    }))
                  : []),
              ]}
            />
          </AccessRow>
        ) : null}

        {accessSource === "admin" ? (
          <AccessRow
            badge={<Badge variant="secondary">Included</Badge>}
            description="Your administrator role includes full Inside the Lab access without a paid membership."
            icon={<IconShieldCheck aria-hidden className="size-5" stroke={2} />}
            title="Administrator access"
          />
        ) : null}

        {accessSource === "preview" && !subscription ? (
          <AccessRow
            badge={<Badge variant="outline">Preview</Badge>}
            description="Preview access shows the full product experience without connecting to a live Stripe customer."
            icon={<IconEye aria-hidden className="size-5" stroke={2} />}
            title="Preview access"
          />
        ) : null}

        {trainingArchive ? (
          <AccessRow
            badge={<Badge variant="secondary">Purchased</Badge>}
            description="Your one-time purchase keeps the complete training history available through your purchase date. An active monthly membership adds future training data and every Lab Note."
            icon={<IconArchive aria-hidden className="size-5" stroke={2} />}
            title={trainingArchivePass.title}
          >
            <AccessDetails
              items={[
                { label: "Payment", value: trainingArchivePass.priceLabel },
                {
                  label: "Training data",
                  value: getTrainingAccessLabel(trainingArchive),
                },
              ]}
            />
          </AccessRow>
        ) : null}

        {!hasAccessRows ? (
          <AccessRow
            badge={<Badge variant="outline">Inactive</Badge>}
            description="This account does not have an active membership or history purchase."
            icon={<IconLockOpen aria-hidden className="size-5" stroke={2} />}
            title="No active access"
          >
            <Link
              className={buttonVariants({
                className:
                  "mt-4 min-h-11 w-full motion-safe:transition-transform motion-safe:active:scale-96 sm:w-auto",
                size: "lg",
              })}
              href={plansHref}
            >
              View plans
            </Link>
          </AccessRow>
        ) : null}
      </CardContent>

      {hasBillingAccount ? (
        <CardFooter className="flex flex-col items-stretch gap-4 bg-secondary/35 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-md text-pretty text-xs leading-relaxed text-muted-foreground">
            {isBillingPreview
              ? "This preview shows the active-member state. Billing actions connect to Stripe in a live account."
              : "Stripe securely handles your payment method and invoices. It will ask you to confirm cancellation, and your access stays active through the end of your paid period."}
          </p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <BillingPortalButton disabled={isBillingPreview} />
            {isActiveSubscription && !hasScheduledCancellation ? (
              <CancelMembershipButton disabled={isBillingPreview} />
            ) : null}
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}
