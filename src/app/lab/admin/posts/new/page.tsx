import type { Metadata } from "next";
import { AdminPostForm } from "@/components/admin/admin-post-form";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Create a Lab Note.",
  title: "New Lab Note | Admin",
};

export default async function NewPostPage() {
  await checkAdmin();

  return <AdminPostForm mode="create" />;
}
