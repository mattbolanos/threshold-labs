import type { Metadata } from "next";
import { AdminPostList } from "@/components/admin/admin-post-list";
import { checkAuth } from "@/lib/auth";
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = {
  description: "Create, edit, and publish Threshold Lab posts.",
  title: "Lab Notes | Admin",
};

export default async function AdminPostsPage() {
  const [, preloadedUserQuery] = await Promise.all([
    checkAuth(),
    preloadAuthQuery(api.auth.getCurrentUser),
  ]);

  return <AdminPostList preloadedUserQuery={preloadedUserQuery} />;
}
