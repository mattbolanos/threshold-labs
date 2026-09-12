"use server";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { fetchAuthAction } from "../auth-server";
import { checkAuthenticated } from ".";

export type TrainingBlockPurchaseRequest =
  { kind: "block"; trainingBlockId: string } | { kind: "bundle" };

export async function createTrainingBlockCheckout(
  purchase: TrainingBlockPurchaseRequest,
  surface: "pricing" | "subscribe" = "subscribe",
) {
  await checkAuthenticated();
  return await fetchAuthAction(api.trainingBlockPurchases.createCheckout, {
    purchase:
      purchase.kind === "block"
        ? {
            kind: "block",
            trainingBlockId: purchase.trainingBlockId as Id<"trainingBlocks">,
          }
        : { kind: "bundle" },
    surface,
  });
}

export async function confirmTrainingBlockCheckout(checkoutSessionId: string) {
  await checkAuthenticated();
  return await fetchAuthAction(api.trainingBlockPurchases.confirmCheckout, {
    checkoutSessionId,
  });
}
