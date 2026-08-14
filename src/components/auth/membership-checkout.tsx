"use client";

import { IconAlertCircle, IconLoader2, IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { INSIDE_LAB_PLAN_NAME } from "@/lib/billing";
import { cn } from "@/lib/utils";

interface MembershipCheckoutProps {
  allowDevelopmentBypass: boolean;
}

type CheckoutStatus = "cancelled" | "error" | "opening";

export function MembershipCheckout({
  allowDevelopmentBypass,
}: MembershipCheckoutProps) {
  const checkoutRequestPending = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<CheckoutStatus>("opening");

  const openCheckout = useCallback(async () => {
    if (checkoutRequestPending.current) return;

    checkoutRequestPending.current = true;
    setError(null);
    setStatus("opening");

    try {
      const { error: checkoutError } = await authClient.subscription.upgrade({
        cancelUrl: "/subscribe?checkout=cancelled",
        plan: INSIDE_LAB_PLAN_NAME,
        successUrl: "/lab/lab-notes",
      });

      if (checkoutError) {
        throw new Error(
          checkoutError.message || "Secure checkout could not be opened.",
        );
      }
    } catch (checkoutError) {
      checkoutRequestPending.current = false;
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Secure checkout could not be opened.",
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const checkoutWasCancelled =
      new URLSearchParams(window.location.search).get("checkout") ===
      "cancelled";

    if (checkoutWasCancelled) {
      setStatus("cancelled");
      return;
    }

    void openCheckout();
  }, [openCheckout]);

  const retryCheckout = () => {
    checkoutRequestPending.current = false;
    window.history.replaceState({}, "", "/subscribe");
    void openCheckout();
  };

  if (status === "opening") {
    return (
      <div
        aria-live="polite"
        className="flex flex-col items-center text-center"
      >
        <IconLoader2 aria-hidden className="text-primary size-7 animate-spin" />
        <h1 className="mt-5 text-xl font-semibold tracking-tight">
          Opening secure checkout…
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          You’ll finish your membership on Stripe.
        </p>
      </div>
    );
  }

  const checkoutCancelled = status === "cancelled";

  return (
    <div className="bg-card w-full rounded-xl border p-6 text-center shadow-xl shadow-black/10">
      <span
        className={cn(
          "mx-auto flex size-10 items-center justify-center rounded-full",
          checkoutCancelled
            ? "bg-muted text-muted-foreground"
            : "bg-destructive/10 text-destructive",
        )}
      >
        {checkoutCancelled ? (
          <IconLock aria-hidden className="size-5" stroke={2} />
        ) : (
          <IconAlertCircle aria-hidden className="size-5" stroke={2} />
        )}
      </span>
      <h1 className="mt-5 text-xl font-semibold tracking-tight">
        {checkoutCancelled ? "Checkout cancelled" : "Checkout didn’t open"}
      </h1>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        {checkoutCancelled
          ? "No payment was made. Continue whenever you’re ready."
          : error || "Try opening secure checkout again."}
      </p>
      <Button className="mt-6 w-full" onClick={retryCheckout} type="button">
        Continue to checkout
      </Button>

      {allowDevelopmentBypass ? (
        <div className="border-border mt-6 border-t pt-6">
          <p className="text-muted-foreground text-xs font-medium">
            Local development only
          </p>
          <Link
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-2 w-full",
            )}
            href="/lab/lab-notes"
          >
            Open Lab without checkout
          </Link>
        </div>
      ) : null}
    </div>
  );
}
