import type { Metadata } from "next";
import { AdminParent } from "@/components/admin/parent";
import { checkAuth } from "@/lib/auth";
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "../../../convex/_generated/api";

export const metadata: Metadata = {
  description: "Admin",
  title: "Admin",
};

export default async function AdminPage() {
  await checkAuth();
  const preloadedUserQuery = await preloadAuthQuery(api.auth.getCurrentUser);

  return (
    <div className="bg-background route-padding-y mx-auto flex max-w-[var(--max-app-width)] flex-col gap-6">
      <AdminParent preloadedUserQuery={preloadedUserQuery} />
    </div>
  );
}
