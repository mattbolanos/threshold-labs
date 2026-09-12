import { IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function MembershipRequired({
  hasBillingAccount,
}: {
  hasBillingAccount: boolean;
}) {
  return (
    <div className="w-full rounded-xl border bg-card/85 p-7 shadow-xl shadow-foreground/5 backdrop-blur-sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/15">
          <IconLock aria-hidden className="size-7 text-primary" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          Lab access required
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re signed in, but this account does not have an active access
          option.
        </p>

        <div className="mt-5 w-full rounded-lg bg-muted/50 p-4 text-left text-sm">
          <p className="font-medium">Access is available when:</p>
          <ul className="mt-2 flex list-inside list-disc flex-col gap-1 text-muted-foreground">
            <li>Your Inside the Lab membership is active</li>
            <li>You purchased a training block</li>
            <li>Your account has administrator access</li>
          </ul>
        </div>

        <Link
          className={buttonVariants({
            className: "mt-6 min-h-11 w-full",
            size: "lg",
          })}
          href={hasBillingAccount ? "/account/billing" : "/subscribe"}
        >
          {hasBillingAccount
            ? "Manage membership & billing"
            : "Choose an access option"}
        </Link>

        <p className="mt-4 text-sm text-muted-foreground">
          Already subscribed? Sign in with the same account you used at
          checkout. Contact your coach if your access still has not updated.
        </p>
        <Link
          className="mt-3 text-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline"
          href="/"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
