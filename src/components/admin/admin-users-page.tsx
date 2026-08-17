import { IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";
import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminUserManager } from "@/components/admin/admin-user-manager";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";

export function AdminUsersPage() {
  return (
    <div className="flex w-full flex-col gap-8">
      <AdminBackLink />

      <PageHeader
        actions={
          <Link
            className={buttonVariants({
              className: "min-h-11 w-full sm:w-auto",
            })}
            href="/lab/admin/add-client"
          >
            <IconUserPlus aria-hidden data-icon="inline-start" />
            <span>Add role default</span>
          </Link>
        }
        description="Review registered accounts, Stripe membership status, and role-based access. Administrator changes take effect immediately."
        eyebrow="Admin"
        title="Users & access"
      />

      <AdminUserManager />
    </div>
  );
}
