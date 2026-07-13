import type { Metadata } from "next";
import { AdminPostForm } from "@/components/admin/admin-post-form";
import { checkAuth } from "@/lib/auth";
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

export const metadata: Metadata = {
  description: "Edit a Lab Note.",
  title: "Edit Lab Note | Admin",
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [, { id }, preloadedUserQuery] = await Promise.all([
    checkAuth(),
    params,
    preloadAuthQuery(api.auth.getCurrentUser),
  ]);

  return (
    <AdminPostForm
      mode="edit"
      postId={id}
      preloadedUserQuery={preloadedUserQuery}
    />
  );
}
