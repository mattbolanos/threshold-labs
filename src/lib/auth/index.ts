import { redirect } from "next/navigation";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";

type CheckAuthOptions = {
  allowUnauthenticatedPreview?: boolean;
};

const isVercelPreview = process.env.VERCEL_ENV === "preview";
const isDev = process.env.NODE_ENV === "development";

export const checkAuth = async ({
  allowUnauthenticatedPreview = false,
}: CheckAuthOptions = {}) => {
  if (allowUnauthenticatedPreview) {
    if (isVercelPreview || isDev) {
      return true;
    }
  }

  const hasToken = await isAuthenticated();

  if (!hasToken) {
    redirect("/login");
  }

  return true;
};

export const checkAdmin = async () => {
  await checkAuth();

  const user = await fetchAuthQuery(api.auth.getCurrentUser);

  if (user?.role !== "admin") {
    redirect("/");
  }

  return user;
};
