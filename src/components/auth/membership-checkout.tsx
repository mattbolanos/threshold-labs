"use client";

import { IconAlertCircle, IconLock, IconStack2 } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckoutOptionCard } from "@/components/auth/checkout-option-card";
import { TrainingBlockCatalog } from "@/components/auth/training-block-catalog";
import {
  type CheckoutOption,
  getCheckoutReturnPath,
  parseCheckoutOption,
} from "@/lib/auth/routes";
import {
  createTrainingBlockCheckout,
  type TrainingBlockPurchaseRequest,
} from "@/lib/auth/training-block-actions";
import { authClient } from "@/lib/auth-client";
import {
  type DiscountOffer,
  discountOffers,
  formatInvitationDate,
  formatWorkoutCount,
  INSIDE_LAB_PLAN_NAME,
  insideLabMembership,
  type TrainingBlockCatalogEntry,
  trainingBlockBundle,
} from "@/lib/billing";
import { cn } from "@/lib/utils";

interface MembershipCheckoutProps {
  blocks: TrainingBlockCatalogEntry[];
  /** An admin-issued offer tied to this member's email, applied at checkout. */
  discountOffer?: DiscountOffer | null;
  hasMembership?: boolean;
  isAuthenticated?: boolean;
  surface?: "pricing" | "subscribe";
}

export function MembershipCheckout({
  blocks,
  discountOffer = null,
  hasMembership = false,
  isAuthenticated = true,
  surface = "subscribe",
}: MembershipCheckoutProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumedCheckout = useRef(false);
  const checkoutRequestPending = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState<CheckoutOption | null>(null);
  const isTransitionPending = Boolean(
    discountOffer?.availableAt && discountOffer.availableAt > Date.now(),
  );

  const runCheckout = useCallback(
    async (option: CheckoutOption, checkout: () => Promise<void>) => {
      if (checkoutRequestPending.current) return;

      if (!isAuthenticated) {
        router.push(
          `/signup?next=${encodeURIComponent(getCheckoutReturnPath(option))}`,
        );
        return;
      }

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
    },
    [isAuthenticated, router, surface],
  );

  const openMembershipCheckout = useCallback(() => {
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
  }, [runCheckout, surface]);

  const openBlockCheckout = useCallback(
    (option: CheckoutOption, purchase: TrainingBlockPurchaseRequest) => {
      return runCheckout(option, async () => {
        const { url } = await createTrainingBlockCheckout(purchase, surface);
        window.location.assign(url);
      });
    },
    [runCheckout, surface],
  );

  const requestedPurchase = parseCheckoutOption(searchParams.get("purchase"));
  useEffect(() => {
    if (!isAuthenticated || !requestedPurchase || resumedCheckout.current)
      return;
    resumedCheckout.current = true;
    if (requestedPurchase === "membership") {
      if (!hasMembership && !isTransitionPending) void openMembershipCheckout();
    } else if (requestedPurchase === "bundle") {
      if (blocks.some((block) => !block.isOwned)) {
        void openBlockCheckout("bundle", { kind: "bundle" });
      }
    } else {
      const trainingBlockId = requestedPurchase.slice("block:".length);
      const block = blocks.find(
        (candidate) => candidate._id === trainingBlockId,
      );
      if (block && !block.isOwned) {
        void openBlockCheckout(requestedPurchase, {
          kind: "block",
          trainingBlockId,
        });
      }
    }
  }, [
    blocks,
    hasMembership,
    isAuthenticated,
    isTransitionPending,
    openBlockCheckout,
    openMembershipCheckout,
    requestedPurchase,
  ]);

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
      {isTransitionPending && discountOffer?.availableAt ? (
        <output className="block rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          Your full lab access is complimentary through{" "}
          {formatInvitationDate(discountOffer.availableAt)}. We’ll email your
          $50/month invitation that day. No payment is needed now.
        </output>
      ) : null}
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
            isTransitionPending
              ? "Complimentary access"
              : hasMembership
                ? "Current plan"
                : membershipOffer
                  ? "Your offer"
                  : "Monthly access"
          }
          buttonLabel={
            isTransitionPending
              ? "Invitation scheduled"
              : hasMembership
                ? "Membership active"
                : membershipOffer
                  ? "Claim your offer"
                  : "Choose monthly membership"
          }
          disabled={opening !== null || isTransitionPending}
          features={[
            membershipOffer
              ? "Every workout, past and present, plus every new one as it lands"
              : "Every workout from 30 days before you join, plus every new one as it lands",
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
            limitations={[
              "Future blocks are sold separately or included with membership",
            ]}
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
