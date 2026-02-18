import type { Metadata } from "next";
import { AdminWorkoutList } from "@/components/admin/admin-workout-list";
import { checkAuth } from "@/lib/auth";
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";

export const metadata: Metadata = {
  description: "Admin",
  title: "Admin",
};

export default async function AdminPage() {
  "use no memo";
  await checkAuth();
  const preloadedUserQuery = await preloadAuthQuery(api.auth.getCurrentUser);

  return <AdminWorkoutList preloadedUserQuery={preloadedUserQuery} />;
}
