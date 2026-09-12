import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminRaceManager } from "@/components/admin/admin-race-manager";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Manually add and manage upcoming races.",
  title: "Races | Admin",
};

async function AdminRacesPageContent() {
  await checkAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink />
      <AdminRaceManager />
    </div>
  );
}

export default function AdminRacesPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <AdminRacesPageContent />
    </Suspense>
  );
}
