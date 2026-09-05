"use client";

import { IconCreditCard, IconLoader2, IconLogout } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import type { PreviewRole } from "@/lib/auth/preview-role";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { PreviewRoleSwitch } from "./preview-role-switch";

export interface NavUserData {
  email: string;
  name: string;
  role?: string | null;
}

interface UserAccountMenuProps {
  actionSize?: ComponentProps<typeof Button>["size"];
  className?: string;
  isPreview: boolean;
  onNavigate?: () => void;
  previewRole: PreviewRole;
  user: NavUserData;
}

interface LogOutButtonProps {
  className?: string;
  onLoggedOut?: () => void;
  size?: ComponentProps<typeof Button>["size"];
}

export function UserAccountMenu({
  actionSize = "default",
  className,
  isPreview,
  onNavigate,
  previewRole,
  user,
}: UserAccountMenuProps) {
  const email = user.email.trim();
  const username = user.name.trim() || email;

  return (
    <div className={cn("flex min-w-0 flex-col gap-2.5", className)}>
      <div className="flex min-w-0 items-center gap-3">
        <Avatar>
          <AvatarFallback className="font-semibold uppercase">
            {getInitials(username, email)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{username}</span>
          <span className="truncate text-xs text-muted-foreground">
            {email}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Link
          className={cn(
            buttonVariants({ size: actionSize, variant: "ghost" }),
            "w-full justify-start",
          )}
          href="/account/billing"
          onClick={onNavigate}
        >
          <IconCreditCard aria-hidden data-icon="inline-start" />
          Billing
        </Link>
        {isPreview ? (
          <PreviewRoleSwitch className="px-2" role={previewRole} />
        ) : (
          <LogOutButton onLoggedOut={onNavigate} size={actionSize} />
        )}
      </div>
    </div>
  );
}

export function LogOutButton({
  className,
  onLoggedOut,
  size = "default",
}: LogOutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLogOut = async () => {
    setHasError(false);
    setIsPending(true);

    await authClient
      .signOut({
        fetchOptions: {
          onError: () => setHasError(true),
          onSuccess: () => {
            onLoggedOut?.();
            router.push("/login");
            router.refresh();
          },
        },
      })
      .catch(() => setHasError(true))
      .finally(() => setIsPending(false));
  };

  return (
    <Button
      className={cn("w-full justify-start", className)}
      disabled={isPending}
      onClick={handleLogOut}
      size={size}
      variant="ghost"
    >
      {isPending ? (
        <IconLoader2 className="animate-spin" data-icon="inline-start" />
      ) : (
        <IconLogout data-icon="inline-start" />
      )}
      <span aria-live="polite">
        {isPending
          ? "Logging out…"
          : hasError
            ? "Log out failed. Try again"
            : "Log out"}
      </span>
    </Button>
  );
}

export function getInitials(name: string, email: string) {
  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
  }

  const fallback = parts[0] || email.split("@")[0] || "";
  return fallback.slice(0, 2).toUpperCase();
}
