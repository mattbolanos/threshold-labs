import {
  formatLabDate,
  mergeWorkoutAccessWindows,
  type WorkoutAccessWindow,
} from "./workoutAccess";

export const TRAINING_BLOCK_PURCHASE_TYPE = "training-block";
export const TRAINING_BLOCK_BUNDLE_PURCHASE_TYPE = "training-block-bundle";
export const TRAINING_BLOCK_PRICE_CENTS = 10_000;
export const TRAINING_BLOCK_BUNDLE_PRICE_CENTS = 40_000;
export const TRAINING_BLOCK_CURRENCY = "usd";

export type TrainingBlockPurchaseKind = "block" | "bundle";

interface TrainingBlockRange {
  endDate: string;
  startDate: string;
}

interface PurchasedBlockRange {
  accessEnd: string;
  accessStart: string;
}

/**
 * A block goes on sale once it has started. An in-progress block sells with
 * the workouts published so far, and the rest of the block appears as it lands
 * because the purchase covers the block's full date range. Future blocks are
 * only available through the monthly membership.
 */
export const isTrainingBlockForSale = (
  block: Pick<TrainingBlockRange, "startDate">,
  today: string,
) => block.startDate <= today;

/**
 * The all-blocks bundle only covers finished blocks.
 */
export const isCompletedTrainingBlock = (
  block: TrainingBlockRange,
  today: string,
) => block.endDate < today;

export const getTrainingBlockPurchaseDate = (purchasedAt: number) =>
  formatLabDate(new Date(purchasedAt));

export const getPurchasedBlockWindows = (
  purchases: readonly PurchasedBlockRange[],
): WorkoutAccessWindow[] =>
  mergeWorkoutAccessWindows(
    purchases.map((purchase) => ({
      from: purchase.accessStart,
      to: purchase.accessEnd,
    })),
  );

export const getPurchaseTypeKey = (kind: TrainingBlockPurchaseKind) =>
  kind === "block"
    ? TRAINING_BLOCK_PURCHASE_TYPE
    : TRAINING_BLOCK_BUNDLE_PURCHASE_TYPE;
