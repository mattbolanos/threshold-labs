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
  formatTrainingAccessDate,
  formatTrainingBlockCount,
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
  hasMembership?: boolean;
  surface?: "pricing" | "subscribe";
}

export function MembershipCheckout({
  blocks,
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
  // The bundle only covers finished blocks; the in-progress block is sold on
  // its own in the catalog below.
  const completedBlocks = blocks.filter((block) => block.isCompleted);
  const ownedBlocks = completedBlocks.filter((block) => block.isOwned);
  const ownsEveryBlock =
    completedBlocks.length > 0 && ownedBlocks.length === completedBlocks.length;
  const totalWorkouts = completedBlocks.reduce(
    (total, block) => total + block.workoutCount,
    0,
  );
  const oldestBlock = completedBlocks.at(-1);
  const newestBlock = completedBlocks[0];
  const openingBlockId = opening?.startsWith("block:")
    ? opening.slice("block:".length)
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
          <IconAlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{error || "Checkout was cancelled. No payment was made."}</span>
        </p>
      ) : null}

      <div
        className={cn(
          "grid gap-5",
          completedBlocks.length > 0 && "md:grid-cols-2",
        )}
      >
        <CheckoutOptionCard
          badge={hasMembership ? "Current plan" : "Monthly access"}
          buttonLabel={
            hasMembership ? "Membership active" : "Choose monthly membership"
          }
          description="Join for new workouts as they are published, plus every Lab Note, billed monthly."
          disabled={opening !== null}
          features={[
            "Workouts from 30 days before you join through the end of your membership",
            "Training overview and performance charts",
            "Every Lab Note, past and future",
          ]}
          icon={<IconLock aria-hidden className="size-5" />}
          isOpening={opening === "membership"}
          isOwned={hasMembership}
          onCheckout={() => void openMembershipCheckout()}
          ownedHref="/account/billing"
          ownedLabel="Manage membership"
          priceLabel={insideLabMembership.priceLabel}
          title={insideLabMembership.title}
          variant={completedBlocks.length > 0 ? "outline" : "default"}
        />

        {oldestBlock && newestBlock ? (
          <CheckoutOptionCard
            badge={ownsEveryBlock ? "Purchased" : "Best value"}
            buttonLabel={
              ownsEveryBlock ? "All blocks purchased" : "Get all blocks"
            }
            description={
              ownedBlocks.length > 0 && !ownsEveryBlock
                ? `Pay $${trainingBlockBundle.price} once for every completed training block, including the ${formatTrainingBlockCount(ownedBlocks.length)} you already own.`
                : `Pay $${trainingBlockBundle.price} once for every completed training block published so far. Access that never expires.`
            }
            disabled={opening !== null}
            features={[
              `${formatTrainingBlockCount(completedBlocks.length)} and ${formatWorkoutCount(totalWorkouts)}, ${formatTrainingAccessDate(oldestBlock.startDate)} – ${formatTrainingAccessDate(newestBlock.endDate)}`,
              "Workout library and performance charts for those dates",
              "Every Lab Note, past and future",
              "Yours to keep",
            ]}
            icon={<IconStack2 aria-hidden className="size-5" />}
            isOpening={opening === "bundle"}
            isOwned={ownsEveryBlock}
            limitations={["New workouts come with the monthly membership"]}
            onCheckout={() =>
              void openBlockCheckout("bundle", { kind: "bundle" })
            }
            ownedHref="/lab/training/workouts"
            ownedLabel="View workouts"
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
