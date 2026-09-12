import { IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";
import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminDiscountCodeManager } from "@/components/admin/admin-discount-code-manager";
import { AdminMemberTransition } from "@/components/admin/admin-member-transition";
import { AdminUserManager } from "@/components/admin/admin-user-manager";
import { AdminUsersErrorBoundary } from "@/components/admin/admin-users-error-boundary";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";

export function AdminUsersPage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-8">
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
        description="See who has lab access, what they purchased, and which workouts they can view. Updates appear automatically."
        eyebrow="Admin"
        title="Users & access"
      />

      <AdminUsersErrorBoundary>
        <AdminUserManager />
      </AdminUsersErrorBoundary>
      <AdminMemberTransition />
      <AdminDiscountCodeManager />
    </div>
  );
}
