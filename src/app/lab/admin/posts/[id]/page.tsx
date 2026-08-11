import type { Metadata } from "next";
import { AdminPostForm } from "@/components/admin/admin-post-form";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Edit a Lab Note.",
  title: "Edit Lab Note | Admin",
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [, { id }] = await Promise.all([checkAdmin(), params]);

  return <AdminPostForm mode="edit" postId={id} />;
}
