"use client";

import {
  IconAlertCircle,
  IconArrowRight,
  IconLoader2,
  IconLock,
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { INSIDE_LAB_PLAN_NAME, insideLabMembership } from "@/lib/billing";
import { cn } from "@/lib/utils";

type CheckoutStatus = "cancelled" | "error" | "opening" | "ready";

export function MembershipCheckout() {
  const checkoutRequestPending = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<CheckoutStatus>("ready");

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

    if (checkoutWasCancelled) setStatus("cancelled");
  }, []);

  const handleCheckout = () => {
    checkoutRequestPending.current = false;
    window.history.replaceState({}, "", "/subscribe");
    void openCheckout();
  };

  const checkoutCancelled = status === "cancelled";
  const checkoutFailed = status === "error";
  const checkoutOpening = status === "opening";

  return (
    <div className="w-full rounded-xl border bg-card/85 p-7 shadow-xl shadow-foreground/5 backdrop-blur-sm">
      <span
        className={cn(
          "mx-auto flex size-10 items-center justify-center rounded-full",
          checkoutFailed
            ? "bg-destructive/10 text-destructive"
            : checkoutCancelled
              ? "bg-muted text-muted-foreground"
              : "bg-primary/15 text-primary",
        )}
      >
        {checkoutFailed ? (
          <IconAlertCircle aria-hidden className="size-5" stroke={2} />
        ) : checkoutOpening ? (
          <IconLoader2 aria-hidden className="size-5 animate-spin" stroke={2} />
        ) : (
          <IconLock aria-hidden className="size-5" stroke={2} />
        )}
      </span>

      <div className="mt-5 text-center">
        <h2 className="text-xl font-semibold tracking-tight">
          {insideLabMembership.title}
        </h2>
        <p className="mt-1 text-2xl font-semibold">
          {insideLabMembership.priceLabel}
        </p>
      </div>

      {checkoutCancelled || checkoutFailed ? (
        <p
          aria-live="polite"
          className={cn(
            "mt-5 rounded-lg px-4 py-3 text-sm",
            checkoutFailed
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground",
          )}
          role={checkoutFailed ? "alert" : "status"}
        >
          {checkoutCancelled
            ? "Checkout was cancelled. No payment was made."
            : error || "Unable to open checkout. Try again."}
        </p>
      ) : null}

      <Button
        className="mt-6 w-full transition-transform active:scale-96"
        disabled={checkoutOpening}
        onClick={handleCheckout}
        size="lg"
        type="button"
      >
        {checkoutOpening ? (
          <>
            <IconLoader2 aria-hidden className="animate-spin" />
            <span>Opening Stripe…</span>
          </>
        ) : (
          <>
            <span>Open Stripe checkout</span>
            <IconArrowRight aria-hidden />
          </>
        )}
      </Button>
    </div>
  );
}
