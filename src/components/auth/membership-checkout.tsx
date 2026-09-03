"use client";

import { IconAlertCircle, IconArchive, IconLock } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { CheckoutOptionCard } from "@/components/auth/checkout-option-card";
import { createTrainingArchiveCheckout } from "@/lib/auth/training-archive-actions";
import { authClient } from "@/lib/auth-client";
import {
  INSIDE_LAB_PLAN_NAME,
  insideLabMembership,
  trainingArchivePass,
} from "@/lib/billing";
import { cn } from "@/lib/utils";

type CheckoutOption = "archive" | "membership";

interface MembershipCheckoutProps {
  hasMembership?: boolean;
  hasTrainingArchive?: boolean;
  surface?: "pricing" | "subscribe";
}

export function MembershipCheckout({
  hasMembership = false,
  hasTrainingArchive = false,
  surface = "subscribe",
}: MembershipCheckoutProps) {
  const searchParams = useSearchParams();
  const checkoutRequestPending = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState<CheckoutOption | null>(null);

  async function runCheckout(
    option: CheckoutOption,
    checkout: () => Promise<void>,
  ) {
    if (checkoutRequestPending.current) return;

    checkoutRequestPending.current = true;
    const returnPath = surface === "pricing" ? "/lab/pricing" : "/subscribe";
    window.history.replaceState({}, "", returnPath);
    setError(null);
    setOpening(option);

    try {
      await checkout();
    } catch (checkoutError) {
      checkoutRequestPending.current = false;
      setOpening(null);
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Secure checkout could not be opened.",
      );
    }
  }

  function openMembershipCheckout() {
    return runCheckout("membership", async () => {
      const { error: checkoutError } = await authClient.subscription.upgrade({
        cancelUrl:
          surface === "pricing"
            ? "/lab/pricing?checkout=cancelled"
            : "/subscribe?checkout=cancelled",
        plan: INSIDE_LAB_PLAN_NAME,
        successUrl: surface === "pricing" ? "/lab/pricing" : "/lab/lab-notes",
      });

      if (checkoutError) {
        throw new Error(
          checkoutError.message || "Secure checkout could not be opened.",
        );
      }
    });
  }

  function openArchiveCheckout() {
    return runCheckout("archive", async () => {
      const { url } = await createTrainingArchiveCheckout(surface);
      window.location.assign(url);
    });
  }

  const cancelledOption = searchParams.get("checkout");
  const checkoutCancelled =
    cancelledOption === "cancelled" || cancelledOption === "archive-cancelled";

  return (
    <div className="space-y-5">
      {checkoutCancelled || error ? (
        <p
          aria-live="polite"
          className={cn(
            "flex items-start gap-2 rounded-lg px-4 py-3 text-sm",
            error
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground",
          )}
          role={error ? "alert" : "status"}
        >
          <IconAlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{error || "Checkout was cancelled. No payment was made."}</span>
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <CheckoutOptionCard
          badge={hasMembership ? "Current plan" : "Full access"}
          buttonLabel={
            hasMembership ? "Membership active" : "Choose monthly membership"
          }
          description="Ongoing access to the complete Threshold Lab experience, billed monthly."
          disabled={opening !== null}
          features={[
            "Lab Notes and future member updates",
            "Training overview and performance charts",
            "Today plus the previous 30 days of workouts",
          ]}
          icon={<IconLock aria-hidden className="size-5" />}
          isOpening={opening === "membership"}
          isOwned={hasMembership}
          onCheckout={() => void openMembershipCheckout()}
          ownedHref="/account/billing"
          ownedLabel="Manage membership"
          priceLabel={insideLabMembership.priceLabel}
          title={insideLabMembership.title}
        />

        <CheckoutOptionCard
          badge={hasTrainingArchive ? "Purchased" : "Training only"}
          buttonLabel={
            hasTrainingArchive ? "Archive purchased" : "Buy archive access"
          }
          description="A one-time pass to the fixed 2025–2026 training archive. It does not renew."
          disabled={opening !== null}
          features={[
            `All training data from ${trainingArchivePass.accessLabel}`,
            "Workout library and training charts for that archive",
          ]}
          icon={<IconArchive aria-hidden className="size-5" />}
          isOpening={opening === "archive"}
          isOwned={hasTrainingArchive}
          limitations={["Does not include Lab Notes or future training data"]}
          onCheckout={() => void openArchiveCheckout()}
          ownedHref="/lab/training/workouts"
          ownedLabel="Open archive"
          priceLabel={trainingArchivePass.priceLabel}
          title={trainingArchivePass.title}
          variant="default"
        />
      </div>
    </div>
  );
}
