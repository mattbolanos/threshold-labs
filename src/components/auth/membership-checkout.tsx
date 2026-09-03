"use client";

import { IconAlertCircle, IconArchive, IconLock } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { CheckoutOptionCard } from "@/components/auth/checkout-option-card";
import { createTrainingArchiveCheckout } from "@/lib/auth/training-archive-actions";
import { authClient } from "@/lib/auth-client";
import {
  historyMembershipBundle,
  INSIDE_LAB_HISTORY_PLAN_NAME,
  INSIDE_LAB_PLAN_NAME,
  insideLabMembership,
  trainingArchivePass,
} from "@/lib/billing";
import { cn } from "@/lib/utils";

type CheckoutOption = "history" | "membership";

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

  async function upgradeMembership(plan: string) {
    const { error: checkoutError } = await authClient.subscription.upgrade({
      cancelUrl:
        surface === "pricing"
          ? "/lab/pricing?checkout=cancelled"
          : "/subscribe?checkout=cancelled",
      plan,
      successUrl: surface === "pricing" ? "/lab/pricing" : "/lab/lab-notes",
    });

    if (checkoutError) {
      throw new Error(
        checkoutError.message || "Secure checkout could not be opened.",
      );
    }
  }

  function openMembershipCheckout() {
    return runCheckout("membership", () =>
      upgradeMembership(INSIDE_LAB_PLAN_NAME),
    );
  }

  function openHistoryCheckout() {
    return runCheckout("history", async () => {
      if (hasMembership && !hasTrainingArchive) {
        const { url } = await createTrainingArchiveCheckout(surface);
        window.location.assign(url);
        return;
      }

      await upgradeMembership(
        hasTrainingArchive
          ? INSIDE_LAB_PLAN_NAME
          : INSIDE_LAB_HISTORY_PLAN_NAME,
      );
    });
  }

  const cancelledOption = searchParams.get("checkout");
  const checkoutCancelled =
    cancelledOption === "cancelled" || cancelledOption === "archive-cancelled";
  const ownsHistoryMembership = hasMembership && hasTrainingArchive;

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
          badge={hasMembership ? "Current plan" : "Monthly access"}
          buttonLabel={
            hasMembership ? "Membership active" : "Choose monthly membership"
          }
          description="Join for ongoing training data and full access to every Lab Note, billed monthly."
          disabled={opening !== null}
          features={[
            "Every Lab Note, past and future",
            "Training overview and performance charts",
            "Workouts from 30 days before you join through the end of your membership",
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
          badge={
            ownsHistoryMembership
              ? "Current access"
              : hasTrainingArchive
                ? "History purchased"
                : "Everything"
          }
          buttonLabel={
            ownsHistoryMembership
              ? "History and membership active"
              : hasTrainingArchive
                ? "Start monthly membership"
                : hasMembership
                  ? "Add complete history"
                  : "Get history + membership"
          }
          description={
            hasTrainingArchive
              ? "Your $400 one-time purchase unlocked every workout published through your purchase date. The $70 monthly membership includes ongoing data and every Lab Note."
              : "Pay $400 once to unlock every workout published so far. The $70 monthly membership includes ongoing data and every Lab Note."
          }
          disabled={opening !== null}
          features={[
            `All training data from ${trainingArchivePass.accessLabel}`,
            "Ongoing workouts and performance charts",
            "Every Lab Note, past and future",
          ]}
          icon={<IconArchive aria-hidden className="size-5" />}
          isOpening={opening === "history"}
          isOwned={ownsHistoryMembership}
          onCheckout={() => void openHistoryCheckout()}
          ownedHref="/account/billing"
          ownedLabel="Manage access"
          priceLabel={
            ownsHistoryMembership
              ? historyMembershipBundle.priceLabel
              : hasTrainingArchive
                ? insideLabMembership.priceLabel
                : hasMembership
                  ? trainingArchivePass.priceLabel
                  : historyMembershipBundle.priceLabel
          }
          title={historyMembershipBundle.title}
          variant="default"
        />
      </div>
    </div>
  );
}
