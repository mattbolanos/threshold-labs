"use server";

import { api } from "../../../convex/_generated/api";
import { fetchAuthAction } from "../auth-server";
import { checkAuthenticated } from ".";

export async function createTrainingArchiveCheckout(
  surface: "pricing" | "subscribe" = "subscribe",
) {
  await checkAuthenticated();
  return await fetchAuthAction(api.trainingArchive.createCheckout, { surface });
}

export async function confirmTrainingArchiveCheckout(
  checkoutSessionId: string,
) {
  await checkAuthenticated();
  return await fetchAuthAction(api.trainingArchive.confirmCheckout, {
    checkoutSessionId,
  });
}
