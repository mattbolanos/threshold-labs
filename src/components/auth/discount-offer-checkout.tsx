"use client";

import {
  IconAlertCircle,
  IconArrowRight,
  IconLoader2,
} from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthHeader } from "@/components/auth/auth-header";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  type DiscountOffer,
  discountOffers,
  INSIDE_LAB_PLAN_NAME,
} from "@/lib/billing";

/**
 * Members with an emailed offer skip plan selection: the membership checkout
 * opens as soon as this renders, with the discount already applied by the
 * server. The page underneath only matters if Stripe cannot be opened.
 */
export function DiscountOfferCheckout({ offer }: { offer: DiscountOffer }) {
  const copy = discountOffers[offer.discountType];
  const autoOpened = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(true);

  const openCheckout = useCallback(async () => {
    setError(null);
    setOpening(true);

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
      setOpening(false);
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Secure checkout could not be opened.",
      );
    }
  }, []);

  useEffect(() => {
    if (autoOpened.current) return;
    autoOpened.current = true;
    void openCheckout();
  }, [openCheckout]);

  return (
    <div className="mx-auto w-full max-w-md">
      <AuthHeader
        description="Taking you to secure checkout with your offer already applied."
        title={copy.title}
      />
      <div className="rounded-xl border bg-card/85 p-7 text-center shadow-xl shadow-foreground/5 backdrop-blur-sm">
        <p className="text-3xl leading-none font-light tracking-tight tabular-nums">
          {copy.priceLabel}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {copy.checkoutNote}
        </p>

        {error ? (
          <div className="mt-6 space-y-4">
            <p
              className="flex items-start gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-left text-sm text-destructive"
              role="alert"
            >
              <IconAlertCircle aria-hidden className="mt-0.5 size-5 shrink-0" />
              <span>{error}</span>
            </p>
            <Button
              className="min-h-11 w-full"
              onClick={() => void openCheckout()}
              size="lg"
              type="button"
            >
              <span>Try again</span>
              <IconArrowRight aria-hidden data-icon="inline-end" stroke={2} />
            </Button>
          </div>
        ) : (
          <output
            aria-live="polite"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <IconLoader2
              aria-hidden
              className="size-4 motion-safe:animate-spin"
            />
            {opening ? "Opening Stripe…" : "Redirecting…"}
          </output>
        )}

        <Link
          className="mt-6 inline-block text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          href="/subscribe?view=all"
        >
          Browse all access options
        </Link>
      </div>
    </div>
  );
}
