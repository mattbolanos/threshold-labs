import { formatLabDate, TRAINING_HISTORY_START_DATE } from "./workoutAccess";

export const TRAINING_ARCHIVE_PRODUCT_KEY = "training-archive-2025-2026";
export const INSIDE_LAB_HISTORY_PLAN_NAME = "inside-the-lab-with-history";
export const TRAINING_ARCHIVE_PRICE_CENTS = 40_000;
export const TRAINING_ARCHIVE_CURRENCY = "usd";
export const TRAINING_ARCHIVE_TITLE = "Complete training history";
export const TRAINING_ARCHIVE_START_DATE = TRAINING_HISTORY_START_DATE;

export const getTrainingArchivePurchaseEnd = (purchasedAt: number) =>
  formatLabDate(new Date(purchasedAt));
