import type { Metadata } from "next";
import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminRaceManager } from "@/components/admin/admin-race-manager";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Manually add and manage upcoming races.",
  title: "Races | Admin",
};

export default async function AdminRacesPage() {
  await checkAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink />
      <AdminRaceManager />
    </div>
  );
}
