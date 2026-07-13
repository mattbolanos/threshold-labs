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
  href = "/admin",
  label = "Back to Admin",
}: AdminBackLinkProps) {
  return (
    <Link
      className={cn(
        "text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors",
        className,
      )}
      href={href}
    >
      <IconArrowLeft aria-hidden className="size-4" />
      {label}
    </Link>
  );
}
