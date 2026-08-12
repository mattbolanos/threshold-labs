"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { PreviewRole } from "@/lib/auth/preview-role";
import { SITE_ROUTES } from "@/lib/routes";
import { getInitials, LogOutButton, type NavUserData } from "./nav-user";
import { PreviewRoleSwitch } from "./preview-role-switch";

const ITEM_CLASS =
  "hover:bg-accent text-muted-foreground hover:text-foreground flex h-13 w-full items-center rounded-md px-2.5 text-base transition-colors duration-100";

interface MobileMenuProps {
  isPreview: boolean;
  previewRole: PreviewRole;
  user?: NavUserData | null;
}

export function MobileMenu({ isPreview, previewRole, user }: MobileMenuProps) {
  const email = user?.email.trim();
  const username = user ? user.name.trim() || email : undefined;

  return (
    <Dialog modal={false}>
      <DialogTrigger
        render={
          <Button
            aria-label="Navigation menu"
            className="group flex cursor-pointer flex-col items-center justify-center gap-1 rounded-full md:hidden"
            size="icon-sm"
            variant="outline"
          />
        }
      >
        <div className="h-0.5 w-3.5 bg-foreground transition-transform duration-200 group-data-popup-open:translate-y-0.75 group-data-popup-open:scale-105 group-data-popup-open:-rotate-45" />
        <div className="h-0.5 w-3.5 bg-foreground transition-transform duration-200 group-data-popup-open:-translate-y-0.75 group-data-popup-open:scale-105 group-data-popup-open:rotate-45" />
      </DialogTrigger>
      <DialogPortal>
        <DialogPopup className="fixed inset-x-0 top-12 bottom-0 z-50 overflow-y-auto overscroll-contain bg-background transition-opacity duration-200 ease-out-quint outline-none data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:opacity-0 motion-reduce:transition-none md:hidden">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <ul className="p-2.5 pt-4">
            {SITE_ROUTES.map((route) => {
              if (
                route.isAdmin &&
                (isPreview ? previewRole : user?.role) !== "admin"
              ) {
                return null;
              }
              return (
                <li key={route.href}>
                  <DialogClose
                    render={<Link className={ITEM_CLASS} href={route.href} />}
                  >
                    {route.label}
                  </DialogClose>
                </li>
              );
            })}

            {user && email && username ? (
              <>
                <li aria-hidden="true" className="py-2">
                  <Separator />
                </li>
                <li className="flex min-w-0 items-center gap-3 px-2.5 py-1.75">
                  <Avatar>
                    <AvatarFallback className="text-xs font-semibold uppercase">
                      {getInitials(username, email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">
                      {username}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {email}
                    </span>
                  </div>
                </li>
                <li className="px-2.5 py-1.5">
                  {isPreview ? (
                    <PreviewRoleSwitch role={previewRole} />
                  ) : (
                    <LogOutButton className="h-10 text-base" />
                  )}
                </li>
              </>
            ) : null}
          </ul>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
