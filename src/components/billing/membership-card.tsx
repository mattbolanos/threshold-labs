import type { UrlObject } from "node:url";
import {
  IconArrowRight,
  IconEye,
  IconLock,
  IconLockOpen,
  IconShieldCheck,
  IconStack2,
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
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatPurchaseDate,
  formatTrainingAccessDate,
  formatTrainingAccessRange,
  formatTrainingBlockCount,
  formatTrainingBlockSpan,
  getMembershipPriceLabel,
  getMembershipStatusDetails,
  insideLabMembership,
  type MembershipSubscription,
  type TrainingBlockAccess,
} from "@/lib/billing";

interface MembershipCardProps {
  accessSource:
    | "admin"
    | "none"
    | "preview"
    | "subscription"
    | "training_blocks";
  hasBillingAccount: boolean;
  isBillingPreview?: boolean;
  plansHref?: Route | UrlObject;
  subscription: MembershipSubscription | null;
  trainingBlocks: TrainingBlockAccess | null;
}

interface AccessCardProps {
  action?: ReactNode;
  badge: ReactNode;
  children?: ReactNode;
  description: string;
  footer?: ReactNode;
  icon: ReactNode;
  title: string;
}

const linkButtonClassName =
  "min-h-10 w-full motion-safe:transition-transform motion-safe:active:scale-96 sm:w-auto";

function AccessCard({
  action,
  badge,
  children,
  description,
  footer,
  icon,
  title,
}: AccessCardProps) {
  return (
    <Card className="bg-card/75 shadow-sm shadow-black/20 [--card-spacing:--spacing(5)]">
      <CardHeader className="gap-x-6 gap-y-1">
        <CardTitle className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span aria-hidden className="text-primary">
            {icon}
          </span>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {badge}
        </CardTitle>
        <CardDescription className="max-w-2xl leading-relaxed text-pretty">
          {description}
        </CardDescription>
        {action ? (
          <CardAction className="col-span-full col-start-1 row-span-1 row-start-3 mt-3 justify-self-stretch sm:col-span-1 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0 sm:justify-self-end">
            {action}
          </CardAction>
        ) : null}
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
      {footer ? (
        <CardFooter className="flex flex-col items-stretch gap-4 bg-secondary/35 sm:flex-row sm:items-center sm:justify-between">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}

function HeadlineStat({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex flex-col gap-0.5 sm:items-end sm:text-right">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-2xl leading-none font-semibold tracking-tight tabular-nums">
        {value}
      </span>
    </p>
  );
}

function FactRow({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          className="flex flex-col gap-1"
          key={`${item.label}-${item.value}`}
        >
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {item.label}
          </dt>
          <dd className="font-semibold tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function TrainingBlockGrid({
  purchases,
}: {
  purchases: TrainingBlockAccess["purchases"];
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {purchases.map((purchase) => (
        <li
          className="flex flex-col gap-2 rounded-lg bg-muted/25 p-4 ring-1 ring-foreground/6"
          key={purchase.trainingBlockId}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="leading-snug font-semibold tracking-tight text-balance">
              {purchase.title}
            </h3>
            <Badge className="shrink-0" variant="outline">
              {formatTrainingBlockSpan(
                purchase.accessStart,
                purchase.accessEnd,
              )}
            </Badge>
          </div>
          <dl className="space-y-0.5 text-sm">
            <div>
              <dt className="sr-only">Dates</dt>
              <dd className="tabular-nums">
                {formatTrainingAccessRange(
                  purchase.accessStart,
                  purchase.accessEnd,
                )}
              </dd>
            </div>
            <div className="flex gap-x-1 text-xs text-muted-foreground">
              <dt>Purchased</dt>
              <dd className="tabular-nums">
                {formatPurchaseDate(purchase.purchasedAt)}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

function StripeFooter({ actions, note }: { actions: ReactNode; note: string }) {
  return (
    <>
      <p className="max-w-md text-xs leading-relaxed text-pretty text-muted-foreground">
        {note}
      </p>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        {actions}
      </div>
    </>
  );
}

export function MembershipCard({
  accessSource,
  hasBillingAccount,
  isBillingPreview = false,
  plansHref = "/subscribe",
  subscription,
  trainingBlocks,
}: MembershipCardProps) {
  const statusDetails = subscription
    ? getMembershipStatusDetails(subscription)
    : null;
  const isActiveSubscription =
    subscription?.status === "active" || subscription?.status === "trialing";
  const hasScheduledCancellation = Boolean(
    subscription?.cancelAtPeriodEnd || subscription?.cancelAt,
  );
  const canCancel = isActiveSubscription && !hasScheduledCancellation;
  const hasAccessCards =
    subscription !== null ||
    trainingBlocks !== null ||
    accessSource === "admin" ||
    accessSource === "preview";
  const previewNote =
    "This preview shows the active-member state. Billing actions connect to Stripe in a live account.";
  const membershipNote = canCancel
    ? "Stripe handles your payment method and invoices, and will ask you to confirm cancellation. Access stays active through the end of your paid period."
    : "Stripe handles your payment method, invoices, and receipts.";
  const showPortalOnBlocks =
    hasBillingAccount && subscription === null && trainingBlocks !== null;
  const membershipFacts =
    subscription && statusDetails
      ? [
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
                  value: formatTrainingAccessDate(subscription.accessStart),
                },
              ]
            : []),
          ...(isActiveSubscription
            ? (subscription.pastAccessWindows ?? []).map((window) => ({
                label: "Earlier membership data",
                value: formatTrainingAccessRange(window.from, window.to),
              }))
            : []),
        ]
      : [];

  return (
    <div className="flex flex-col gap-6">
      {subscription && statusDetails ? (
        <AccessCard
          action={
            <HeadlineStat
              label={canCancel ? "You pay" : "Plan price"}
              value={getMembershipPriceLabel(subscription)}
            />
          }
          badge={
            <Badge variant={statusDetails.badgeVariant}>
              {statusDetails.badgeLabel}
            </Badge>
          }
          description={statusDetails.description}
          footer={
            hasBillingAccount ? (
              <StripeFooter
                actions={
                  <>
                    <BillingPortalButton disabled={isBillingPreview} />
                    {canCancel ? (
                      <CancelMembershipButton disabled={isBillingPreview} />
                    ) : null}
                  </>
                }
                note={isBillingPreview ? previewNote : membershipNote}
              />
            ) : null
          }
          icon={<IconLock className="size-5" stroke={2} />}
          title={insideLabMembership.title}
        >
          {membershipFacts.length > 0 ? (
            <FactRow items={membershipFacts} />
          ) : null}
        </AccessCard>
      ) : null}

      {accessSource === "admin" ? (
        <AccessCard
          badge={<Badge variant="accent">Included</Badge>}
          description="Your administrator role includes full Inside the Lab access without a paid membership."
          icon={<IconShieldCheck className="size-5" stroke={2} />}
          title="Administrator access"
        />
      ) : null}

      {accessSource === "preview" && !subscription ? (
        <AccessCard
          badge={<Badge variant="outline">Preview</Badge>}
          description="Preview access shows the full product experience without connecting to a live Stripe customer."
          icon={<IconEye className="size-5" stroke={2} />}
          title="Preview access"
        />
      ) : null}

      {trainingBlocks ? (
        <AccessCard
          action={
            <Link
              className={buttonVariants({
                className: linkButtonClassName,
                variant: "outline",
              })}
              href={plansHref}
            >
              <span>Browse more blocks</span>
              <IconArrowRight aria-hidden data-icon="inline-end" stroke={2} />
            </Link>
          }
          badge={
            <Badge variant="accent">
              {`${formatTrainingBlockCount(trainingBlocks.purchases.length)} purchased`}
            </Badge>
          }
          description="One-time purchases that stay in your Workout Library for good, along with every Lab Note and the full performance charts. An active monthly membership adds new workouts as they are published."
          footer={
            showPortalOnBlocks ? (
              <StripeFooter
                actions={<BillingPortalButton disabled={isBillingPreview} />}
                note="Receipts for your block purchases are available in Stripe."
              />
            ) : null
          }
          icon={<IconStack2 className="size-5" stroke={2} />}
          title="Training blocks"
        >
          <TrainingBlockGrid purchases={trainingBlocks.purchases} />
        </AccessCard>
      ) : null}

      {!hasAccessCards ? (
        <AccessCard
          badge={<Badge variant="outline">Inactive</Badge>}
          description="This account does not have an active membership or training block purchase."
          footer={
            <StripeFooter
              actions={
                <>
                  {hasBillingAccount ? (
                    <BillingPortalButton disabled={isBillingPreview} />
                  ) : null}
                  <Link
                    className={buttonVariants({
                      className: linkButtonClassName,
                      size: "lg",
                    })}
                    href={plansHref}
                  >
                    <span>View plans</span>
                    <IconArrowRight
                      aria-hidden
                      data-icon="inline-end"
                      stroke={2}
                    />
                  </Link>
                </>
              }
              note={
                hasBillingAccount
                  ? "Past invoices and receipts are available in Stripe."
                  : "Start a membership or buy individual training blocks to unlock Inside the Lab."
              }
            />
          }
          icon={<IconLockOpen className="size-5" stroke={2} />}
          title="No active access"
        />
      ) : null}
    </div>
  );
}
