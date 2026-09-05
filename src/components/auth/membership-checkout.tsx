"use client";

import { IconAlertCircle, IconLock, IconStack2 } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { CheckoutOptionCard } from "@/components/auth/checkout-option-card";
import { TrainingBlockCatalog } from "@/components/auth/training-block-catalog";
import {
  createTrainingBlockCheckout,
  type TrainingBlockPurchaseRequest,
} from "@/lib/auth/training-block-actions";
import { authClient } from "@/lib/auth-client";
import {
  type DiscountOffer,
  discountOffers,
  formatWorkoutCount,
  INSIDE_LAB_PLAN_NAME,
  insideLabMembership,
  type TrainingBlockCatalogEntry,
  trainingBlockBundle,
} from "@/lib/billing";
import { cn } from "@/lib/utils";

type CheckoutOption = "bundle" | "membership" | `block:${string}`;

interface MembershipCheckoutProps {
  blocks: TrainingBlockCatalogEntry[];
  /** An admin-issued offer tied to this member's email, applied at checkout. */
  discountOffer?: DiscountOffer | null;
  hasMembership?: boolean;
  surface?: "pricing" | "subscribe";
}

export function MembershipCheckout({
  blocks,
  discountOffer = null,
  hasMembership = false,
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

  function openBlockCheckout(
    option: CheckoutOption,
    purchase: TrainingBlockPurchaseRequest,
  ) {
    return runCheckout(option, async () => {
      const { url } = await createTrainingBlockCheckout(purchase, surface);
      window.location.assign(url);
    });
  }

  const cancelledOption = searchParams.get("checkout");
  const checkoutCancelled =
    cancelledOption === "cancelled" || cancelledOption === "blocks-cancelled";
  // The bundle covers every block on sale, including the in-progress block.
  const ownsEveryBlock =
    blocks.length > 0 && blocks.every((block) => block.isOwned);
  const totalWorkouts = blocks.reduce(
    (total, block) => total + block.workoutCount,
    0,
  );
  const openingBlockId = opening?.startsWith("block:")
    ? opening.slice("block:".length)
    : null;
  const membershipOffer =
    discountOffer && !hasMembership
      ? discountOffers[discountOffer.discountType]
      : null;

  return (
    <div className="space-y-10">
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
          <IconAlertCircle aria-hidden className="mt-0.5 size-6 shrink-0" />
          <span>{error || "Checkout was cancelled. No payment was made."}</span>
        </p>
      ) : null}

      <div className={cn("grid gap-5", blocks.length > 0 && "md:grid-cols-2")}>
        <CheckoutOptionCard
          badge={
            hasMembership
              ? "Current plan"
              : membershipOffer
                ? "Your offer"
                : "Monthly access"
          }
          buttonLabel={
            hasMembership
              ? "Membership active"
              : membershipOffer
                ? "Claim your offer"
                : "Choose monthly membership"
          }
          disabled={opening !== null}
          features={[
            membershipOffer
              ? "Every workout, past and present, plus every new one as it lands"
              : "Every workout from the month before you join, plus every new one as it lands",
            "Training overview and full performance charts",
            "Every Lab Note, past and future",
          ]}
          icon={<IconLock aria-hidden className="size-6" />}
          isOpening={opening === "membership"}
          isOwned={hasMembership}
          onCheckout={() => void openMembershipCheckout()}
          ownedHref="/account/billing"
          ownedLabel="Manage membership"
          priceLabel={
            membershipOffer?.priceLabel ?? insideLabMembership.priceLabel
          }
          title={insideLabMembership.title}
          variant="default"
        />

        {blocks.length > 0 ? (
          <CheckoutOptionCard
            badge={ownsEveryBlock ? "Purchased" : "Best value"}
            buttonLabel={
              ownsEveryBlock ? "All blocks purchased" : "Get all blocks"
            }
            disabled={opening !== null}
            features={[
              `All ${blocks.length} completed + in progress training blocks (${formatWorkoutCount(totalWorkouts)})`,
              "Training overview and full performance charts",
              "Every Lab Note, past and future",
            ]}
            icon={<IconStack2 aria-hidden className="size-6" />}
            isOpening={opening === "bundle"}
            isOwned={ownsEveryBlock}
            limitations={["Future blocks require the monthly membership"]}
            onCheckout={() =>
              void openBlockCheckout("bundle", { kind: "bundle" })
            }
            ownedHref="/lab/training/workouts"
            ownedLabel="Purchased"
            priceLabel={trainingBlockBundle.priceLabel}
            title={trainingBlockBundle.title}
          />
        ) : null}
      </div>

      <TrainingBlockCatalog
        blocks={blocks}
        disabled={opening !== null}
        onCheckout={(trainingBlockId) =>
          void openBlockCheckout(`block:${trainingBlockId}`, {
            kind: "block",
            trainingBlockId,
          })
        }
        openingBlockId={openingBlockId}
      />
    </div>
  );
}
