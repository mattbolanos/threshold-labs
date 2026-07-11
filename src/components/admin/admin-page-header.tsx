import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function AdminPageHeader() {
  return (
    <div className="route-padding-x flex items-end justify-between">
      <div>
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          Admin
        </p>
        <h2 className="text-lg font-semibold tracking-tight">
          Workout Manager
        </h2>
      </div>
      <Link className={buttonVariants()} href="/admin/workout/new">
        <IconPlus aria-hidden />
        <span>New Workout</span>
      </Link>
    </div>
  );
}
