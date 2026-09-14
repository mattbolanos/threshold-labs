import { IconArrowLeft } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminBackLinkProps {
  className?: string;
  href?: Route;
  label?: string;
}

export function AdminBackLink({
  className,
  href = "/lab/admin",
  label = "Back to Admin",
}: AdminBackLinkProps) {
  return (
    <Link
      className={cn(
        "text-muted-foreground hover:bg-muted hover:text-foreground -ms-2 inline-flex min-h-9 self-start items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors",
        className,
      )}
      href={href}
    >
      <IconArrowLeft aria-hidden className="size-4" />
      {label}
    </Link>
  );
}
