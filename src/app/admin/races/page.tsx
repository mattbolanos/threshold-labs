import type { Metadata } from "next";
import { AdminRacePlanner } from "@/components/admin/admin-race-planner";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Refresh upcoming HYROX races and choose the planned events.",
  title: "HYROX Race Planner | Admin",
};

export default async function AdminRacesPage() {
  await checkAdmin();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          HYROX race planner
        </h1>
      </header>
      <AdminRacePlanner />
    </div>
  );
}
