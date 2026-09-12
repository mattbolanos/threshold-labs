import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminBundlePricing } from "@/components/admin/admin-bundle-pricing";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminQuickLinks } from "@/components/admin/admin-quick-links";
import { AdminWorkoutList } from "@/components/admin/admin-workout-list";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Manage workouts, races, training blocks, Lab Notes, invites, and weekly totals.",
  title: "Admin | Workout Manager",
};

async function AdminPageContent() {
  await checkAdmin();

  return (
    <div className="flex flex-col gap-10">
      <AdminPageHeader />
      <AdminQuickLinks />
      <AdminBundlePricing />
      <AdminWorkoutList />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <AdminPageContent />
    </Suspense>
  );
}
