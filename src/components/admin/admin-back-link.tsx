import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminBackLinkProps {
  className?: string;
}

export function AdminBackLink({ className }: AdminBackLinkProps) {
  return (
    <Link
      className={cn(
        "text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors",
        className,
      )}
      href="/admin"
    >
      <IconArrowLeft aria-hidden className="size-4" />
      Back to Admin
    </Link>
  );
}
