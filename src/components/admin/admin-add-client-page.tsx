"use client";

import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminClientInviteForm } from "./admin-client-invite-form";

export function AdminAddClientPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <AdminBackLink />
      </div>

      <div>
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          Access
        </p>
        <h2 className="text-lg font-semibold tracking-tight">Add Client</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Create or update signup invites for clients and coaches.
        </p>
      </div>

      <div className="border-primary/20 relative border-t pt-4">
        <div className="bg-primary/40 absolute top-0 left-0 h-0.5 w-16" />
        <AdminClientInviteForm />
      </div>
    </div>
  );
}
