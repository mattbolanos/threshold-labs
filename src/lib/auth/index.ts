import { redirect } from "next/navigation";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";
import { getPreviewAuthState, isVercelPreview } from "./preview.server";

type CheckAuthOptions = {
  allowUnauthenticatedPreview?: boolean;
};

const isDev = process.env.NODE_ENV === "development";

export const checkAuth = async ({
  allowUnauthenticatedPreview = false,
}: CheckAuthOptions = {}) => {
  if (isVercelPreview || (allowUnauthenticatedPreview && isDev)) {
    return true;
  }

  const hasToken = await isAuthenticated();

  if (!hasToken) {
    redirect("/login");
  }

  return true;
};

export const checkAdmin = async () => {
  const preview = await getPreviewAuthState();

  if (preview.enabled) {
    if (preview.role !== "admin") {
      redirect("/");
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
    redirect("/");
  }

  return user;
};
