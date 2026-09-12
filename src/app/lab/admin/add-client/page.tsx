import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAddClientPage } from "@/components/admin/admin-add-client-page";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Create or update pre-signup role defaults.",
  title: "Add Role Default | Admin",
};

async function AddClientPageContent() {
  await checkAdmin();

  return <AdminAddClientPage />;
}

export default function AddClientPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <AddClientPageContent />
    </Suspense>
  );
}
