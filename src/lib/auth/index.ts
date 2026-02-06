import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";

export const checkAuth = async () => {
  const hasToken = await isAuthenticated();

  if (!hasToken) {
    redirect("/login");
  }

  return true;
};
