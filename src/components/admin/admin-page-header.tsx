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
            className={buttonVariants({ variant: "outline" })}
            href="/admin/posts/new"
          >
            <IconNotebook data-icon="inline-start" />
            <span>New Post</span>
          </Link>
          <Link className={buttonVariants()} href="/admin/workout/new">
            <IconPlus data-icon="inline-start" />
            <span>New Workout</span>
          </Link>
        </>
      }
      eyebrow="Admin"
      title="Workout Manager"
    />
  );
}
