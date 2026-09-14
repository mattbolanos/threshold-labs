import { IconNotebook, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";

export function AdminPageHeader() {
  return (
    <PageHeader
      actions={
        <>
          <Link
            className={buttonVariants({
              className: "min-h-11 w-full sm:w-auto",
              variant: "outline",
            })}
            href="/lab/admin/posts/new"
          >
            <IconNotebook data-icon="inline-start" />
            <span>New Post</span>
          </Link>
          <Link
            className={buttonVariants({
              className: "min-h-11 w-full sm:w-auto",
            })}
            href="/lab/admin/workout/new"
          >
            <IconPlus data-icon="inline-start" />
            <span>New Workout</span>
          </Link>
        </>
      }
      description="Manage member access, training content, and operations from one workspace."
      eyebrow="Admin"
      title="Workout Manager"
    />
  );
}
