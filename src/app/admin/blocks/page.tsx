import type { Metadata } from "next";
import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminTrainingBlockList } from "@/components/admin/admin-training-block-list";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Create and manage dated training blocks.",
  title: "Training Blocks | Admin",
};

export default async function AdminTrainingBlocksPage() {
  await checkAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink />
      <AdminTrainingBlockList />
    </div>
  );
}
