import { redirect } from "next/navigation";
import { cache } from "react";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";
import { getPreviewAuthState, isVercelPreview } from "./preview.server";

export const isAppAuthenticated = async () =>
  isVercelPreview || (await isAuthenticated());

export const checkAuthenticated = cache(async () => {
  const hasToken = await isAppAuthenticated();

  if (!hasToken) {
    redirect("/login");
  }

  return true;
});

export const getPostAuthDestination = cache(async () => {
  await checkAuthenticated();

  if (isVercelPreview) {
    return "/lab/lab-notes" as const;
  }

  const access = await fetchAuthQuery(api.auth.getCurrentLabAccess, {});

  return access.hasAccess
    ? ("/lab/lab-notes" as const)
    : ("/subscribe" as const);
});

export const checkLabAccess = cache(async () => {
  await checkAuthenticated();

  if (isVercelPreview) {
    return true;
  }

  const access = await fetchAuthQuery(api.auth.getCurrentLabAccess, {});

  if (!access.hasAccess) {
    redirect("/unauthorized");
  }

  return true;
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
