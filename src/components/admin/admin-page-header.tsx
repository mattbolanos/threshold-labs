import { IconNotebook, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function AdminPageHeader() {
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          Admin
        </p>
        <h2 className="text-lg font-semibold tracking-tight">
          Workout Manager
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-2">
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
      </div>
    </div>
  );
}
