import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminTrainingBlockList } from "@/components/admin/admin-training-block-list";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Create and manage dated training blocks.",
  title: "Training Blocks | Admin",
};

async function AdminTrainingBlocksPageContent() {
  await checkAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink />
      <AdminTrainingBlockList />
    </div>
  );
}

export default function AdminTrainingBlocksPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <AdminTrainingBlocksPageContent />
    </Suspense>
  );
}
