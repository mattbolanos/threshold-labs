"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PreviewRole } from "@/lib/auth/preview-role";
import {
  getInitials,
  type NavUserData,
  UserAccountMenu,
} from "./user-account-menu";

export type { NavUserData } from "./user-account-menu";

interface NavUserProps {
  isPreview: boolean;
  previewRole: PreviewRole;
  user?: NavUserData | null;
}

export function NavUser({ isPreview, previewRole, user }: NavUserProps) {
  if (!user) {
    return null;
  }

  const email = user.email.trim();
  const username = user.name.trim() || email;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            aria-label={`${username} menu`}
            className="rounded-full max-md:hidden"
            size="icon"
            variant="ghost"
          />
        }
      >
        <Avatar>
          <AvatarFallback className="font-semibold uppercase">
            {getInitials(username, email)}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <UserAccountMenu
          isPreview={isPreview}
          previewRole={previewRole}
          user={user}
        />
      </PopoverContent>
    </Popover>
  );
}
