import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";

export const checkAuth = async () => {
  if (process.env.VERCEL_ENV === "preview") {
    return true;
  }

  const hasToken = await isAuthenticated();

  if (!hasToken) {
    redirect("/login");
  }

  return true;
};
