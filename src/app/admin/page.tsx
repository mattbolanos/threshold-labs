import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminQuickLinks } from "@/components/admin/admin-quick-links";
import { AdminWorkoutList } from "@/components/admin/admin-workout-list";
import { checkAuth } from "@/lib/auth";
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";

export const metadata: Metadata = {
  description: "Manage workouts, invites, and weekly totals.",
  title: "Admin | Workout Manager",
};

export default async function AdminPage() {
  "use no memo";

  const [, preloadedUserQuery] = await Promise.all([
    checkAuth(),
    preloadAuthQuery(api.auth.getCurrentUser),
  ]);

  return (
    <>
      <AdminPageHeader />
      <AdminQuickLinks />
      <AdminWorkoutList preloadedUserQuery={preloadedUserQuery} />
    </>
  );
}
