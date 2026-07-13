import type { Metadata } from "next";
import { AdminPostForm } from "@/components/admin/admin-post-form";
import { checkAuth } from "@/lib/auth";
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

export const metadata: Metadata = {
  description: "Create a Lab Note.",
  title: "New Lab Note | Admin",
};

export default async function NewPostPage() {
  const [, preloadedUserQuery] = await Promise.all([
    checkAuth(),
    preloadAuthQuery(api.auth.getCurrentUser),
  ]);

  return (
    <AdminPostForm mode="create" preloadedUserQuery={preloadedUserQuery} />
  );
}
