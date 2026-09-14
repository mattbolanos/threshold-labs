"use client";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { PageHeader } from "@/components/page-header";
import { AdminClientInviteForm } from "./admin-client-invite-form";

export function AdminAddClientPage() {
  return (
    <div className="flex w-full flex-col gap-8">
      <AdminBackLink href="/lab/admin/users" label="Back to Users & access" />

      <PageHeader
        description="Save the role an email should receive at first signup. Manage registered users and their current roles from Users & access."
        eyebrow="Users & access"
        title="Add role default"
      />

      <AdminClientInviteForm />
    </div>
  );
}
