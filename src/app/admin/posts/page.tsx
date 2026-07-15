import type { Metadata } from "next";
import { AdminPostList } from "@/components/admin/admin-post-list";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Create, edit, and publish Threshold Lab posts.",
  title: "Lab Notes | Admin",
};

export default async function AdminPostsPage() {
  await checkAdmin();

  return <AdminPostList />;
}
