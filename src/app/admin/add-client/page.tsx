import type { Metadata } from "next";
import { AdminAddClientPage } from "@/components/admin/admin-add-client-page";
import { checkAuth } from "@/lib/auth";
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = {
  description: "Create or update client invites",
  title: "Add Client",
};

export default async function AddClientPage() {
  "use no memo";
  await checkAuth();
  const preloadedUserQuery = await preloadAuthQuery(api.auth.getCurrentUser);

  return <AdminAddClientPage preloadedUserQuery={preloadedUserQuery} />;
}
