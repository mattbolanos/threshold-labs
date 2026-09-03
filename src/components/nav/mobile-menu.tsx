"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { PreviewRole } from "@/lib/auth/preview-role";
import { SITE_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { type NavUserData, UserAccountMenu } from "./user-account-menu";

const ITEM_CLASS = cn(
  buttonVariants({ size: "lg", variant: "ghost" }),
  "w-full justify-start",
);

interface MobileMenuProps {
  hasAccess: boolean;
  hasFullAccess: boolean;
  isPreview: boolean;
  previewRole: PreviewRole;
  user?: NavUserData | null;
}

export function MobileMenu({
  hasAccess,
  hasFullAccess,
  isPreview,
  previewRole,
  user,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog modal={false} onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button
            aria-label={open ? "Close menu" : "Open menu"}
            className="group flex cursor-pointer flex-col gap-1 rounded-full md:hidden"
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
          <nav
            aria-label="Primary navigation"
            className="mx-auto flex min-h-full w-full max-w-7xl flex-col p-4"
          >
            <ul className="flex flex-col gap-1">
              {SITE_ROUTES.map((route) => {
                if (
                  route.isAdmin &&
                  (isPreview ? previewRole : user?.role) !== "admin"
                ) {
                  return null;
                }
                if (route.requiresAccess && !hasAccess) {
                  return null;
                }
                if (route.requiresFullAccess && !hasFullAccess) {
                  return null;
                }

                return (
                  <li key={route.href}>
                    <Link
                      className={ITEM_CLASS}
                      href={route.href}
                      onClick={() => setOpen(false)}
                    >
                      {route.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {user ? (
              <div className="mt-auto flex flex-col gap-4 pt-8">
                <Separator />
                <UserAccountMenu
                  actionSize="lg"
                  isPreview={isPreview}
                  onNavigate={() => setOpen(false)}
                  previewRole={previewRole}
                  user={user}
                />
              </div>
            ) : null}
          </nav>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
