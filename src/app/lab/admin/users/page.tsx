import type { Metadata } from "next";
import { AdminUsersPage } from "@/components/admin/admin-users-page";

export const metadata: Metadata = {
  description: "Manage member roles, subscriptions, and administrator access.",
  title: "Users & Access | Admin",
};

export default function UsersPage() {
  return <AdminUsersPage />;
}
