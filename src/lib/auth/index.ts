import { redirect } from "next/navigation";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";
import { getPreviewAuthState, isVercelPreview } from "./preview.server";

export const isAppAuthenticated = async () =>
  isVercelPreview || (await isAuthenticated());

export const checkAuth = async () => {
  const hasToken = await isAppAuthenticated();

  if (!hasToken) {
    redirect("/login");
  }

  return true;
};

export const checkAdmin = async () => {
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
};
