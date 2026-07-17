import type { Metadata } from "next";
import { AdminAddClientPage } from "@/components/admin/admin-add-client-page";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Create or update client invites",
  title: "Add Client",
};

export default async function AddClientPage() {
  await checkAdmin();

  return <AdminAddClientPage />;
}
