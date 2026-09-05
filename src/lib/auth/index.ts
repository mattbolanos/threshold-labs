import { redirect } from "next/navigation";
import { cache } from "react";
import {
  fetchAuthAction,
  fetchAuthQuery,
  isAuthenticated,
} from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";
import {
  getPreviewAuthState,
  isPreviewAuthBypassEnabled,
} from "./preview.server";

export const isAppAuthenticated = async () =>
  isPreviewAuthBypassEnabled || (await isAuthenticated());

export const checkAuthenticated = cache(async () => {
  const hasToken = await isAppAuthenticated();

  if (!hasToken) {
    redirect("/login");
  }

  return true;
});

export const getPostAuthDestination = cache(async () => {
  await checkAuthenticated();

  if (isPreviewAuthBypassEnabled) {
    return "/lab/lab-notes" as const;
  }

  const access = await fetchAuthQuery(api.auth.getCurrentLabAccess, {});

  return access.hasAccess
    ? ("/lab/lab-notes" as const)
    : ("/subscribe" as const);
});

export const getCurrentLabAccess = cache(async () => {
  await checkAuthenticated();

  if (isPreviewAuthBypassEnabled) {
    return {
      hasAccess: true,
      hasBillingAccount: false,
      source: "preview" as const,
      subscription: null,
      trainingBlocks: null,
    };
  }

  return fetchAuthQuery(api.auth.getCurrentLabAccess, {});
});

export const getTrainingBlockCatalog = cache(async () => {
  await checkAuthenticated();

  return fetchAuthQuery(api.trainingBlockPurchases.getTrainingBlockCatalog, {});
});

export const getPendingDiscountOffer = cache(async () => {
  await checkAuthenticated();

  if (isPreviewAuthBypassEnabled) {
    return null;
  }

  return fetchAuthQuery(api.discountCodes.getPendingDiscountOffer, {});
});

export const getCurrentStripeMembership = cache(async () => {
  await checkAuthenticated();

  if (isPreviewAuthBypassEnabled) {
    return null;
  }

  return fetchAuthAction(api.billing.getCurrentStripeMembership, {});
});

export const checkLabAccess = cache(async () => {
  const access = await getCurrentLabAccess();

  if (!access.hasAccess) {
    redirect("/unauthorized");
  }

  return access;
});

export const checkAdmin = cache(async () => {
  await checkLabAccess();

  const preview = await getPreviewAuthState();

  if (preview.enabled) {
    if (preview.role !== "admin") {
      redirect("/lab/lab-notes");
    }

    return {
      email: "preview@threshold.local",
      name: "Preview Admin",
      role: preview.role,
    };
  }

  const user = await fetchAuthQuery(api.auth.getCurrentUser, {});

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/lab/lab-notes");
  }

  return user;
});
