"use client";

import { IconAlertCircle, IconCircleX } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export function CancelMembershipButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const requestPending = useRef(false);
  const [error, setError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function openCancellationFlow() {
    if (requestPending.current) return;

    requestPending.current = true;
    setError(false);
    setIsPending(true);

    try {
      const { error: cancellationError } = await authClient.subscription.cancel(
        {
          returnUrl: "/account/billing",
        },
      );

      if (cancellationError) {
        throw new Error("Unable to open the Stripe cancellation flow.");
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
        onClick={() => void openCancellationFlow()}
        size="lg"
        type="button"
        variant="destructive"
      >
        {isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <IconCircleX aria-hidden data-icon="inline-start" stroke={2} />
        )}
        <span aria-live="polite">
          {isPending ? "Opening Stripe…" : "Cancel membership"}
        </span>
      </Button>

      {error ? (
        <Alert className="sm:max-w-sm" variant="destructive">
          <IconAlertCircle aria-hidden stroke={2} />
          <AlertTitle>Unable to open cancellation</AlertTitle>
          <AlertDescription>
            Check your connection and try again. Your membership is still
            active.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
