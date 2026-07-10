"use client";

import { IconLoader2, IconLogout } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface User {
  email: string;
  name: string;
}

interface NavUserProps {
  user?: User | null;
}

interface LogOutButtonProps {
  className?: string;
  onLoggedOut?: () => void;
}

export function NavUser({ user }: NavUserProps) {
  if (!user) {
    return null;
  }

  const email = user.email.trim();
  const username = user.name.trim() || email;
  const initials = getInitials(username, email);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            aria-label={`${username} menu`}
            className="focus-visible:ring-ring focus-visible:ring-offset-background rounded-full outline-hidden transition-all duration-150 ease-in-out hover:scale-105 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-offset-2 max-md:hidden"
            type="button"
          />
        }
      >
        <Avatar>
          <AvatarFallback className="text-xs font-semibold uppercase">
            {initials}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1 shadow-md">
        <div className="mb-1 flex flex-col gap-1 px-2 py-1.5">
          <span className="text-sm font-medium">{username}</span>
          <span className="text-muted-foreground text-xs">{email}</span>
        </div>
        <LogOutButton />
      </PopoverContent>
    </Popover>
  );
}

export function LogOutButton({ className, onLoggedOut }: LogOutButtonProps) {
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
