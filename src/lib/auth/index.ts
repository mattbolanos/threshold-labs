import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";

type CheckAuthOptions = {
  allowUnauthenticatedPreview?: boolean;
};

const isVercelPreview = process.env.VERCEL_ENV === "preview";
const isDev = false;

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
