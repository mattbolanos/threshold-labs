"use client";

import { IconAlertCircle, IconCreditCard } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export function BillingPortalButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const requestPending = useRef(false);
  const [error, setError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function openBillingPortal() {
    if (requestPending.current) return;

    requestPending.current = true;
    setError(false);
    setIsPending(true);

    try {
      const { error: portalError } =
        await authClient.subscription.billingPortal({
          returnUrl: "/account/billing",
        });

      if (portalError) {
        throw new Error("Unable to create a Stripe billing portal session.");
      }
    } catch {
      requestPending.current = false;
      setError(true);
      setIsPending(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
      <Button
        className="min-h-11 w-full motion-safe:transition-transform motion-safe:active:scale-96 sm:w-auto"
        disabled={disabled || isPending}
        onClick={() => void openBillingPortal()}
        size="lg"
        type="button"
      >
        {isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <IconCreditCard aria-hidden data-icon="inline-start" stroke={2} />
        )}
        <span aria-live="polite">
          {isPending ? "Opening Stripe…" : "Payment & invoices"}
        </span>
      </Button>

      {error ? (
        <Alert className="sm:max-w-sm" variant="destructive">
          <IconAlertCircle aria-hidden stroke={2} />
          <AlertTitle>Unable to open Stripe</AlertTitle>
          <AlertDescription>
            Check your connection and try again.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
