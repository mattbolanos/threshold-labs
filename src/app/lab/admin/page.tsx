import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminQuickLinks } from "@/components/admin/admin-quick-links";
import { AdminWorkoutList } from "@/components/admin/admin-workout-list";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Manage workouts, races, training blocks, Lab Notes, invites, and weekly totals.",
  title: "Admin | Workout Manager",
};

export default async function AdminPage() {
  await checkAdmin();

  return (
    <>
      <AdminPageHeader />
      <AdminQuickLinks />
      <AdminWorkoutList />
    </>
  );
}
