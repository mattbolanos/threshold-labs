"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { createPortal } from "react-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PreviewRole } from "@/lib/auth/preview-role";
import { SITE_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { getInitials, LogOutButton, type NavUserData } from "./nav-user";
import { PreviewRoleSwitch } from "./preview-role-switch";

const ITEM_CLASS =
  "hover:bg-accent text-muted-foreground hover:text-foreground flex h-13 cursor-pointer items-center rounded-md px-2.5 text-base transition-colors duration-100";

interface MobileMenuProps {
  isPreview: boolean;
  previewRole: PreviewRole;
  user?: NavUserData | null;
}

export function MobileMenu({ isPreview, previewRole, user }: MobileMenuProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const previousPathname = React.useRef(pathname);
  const email = user?.email.trim();
  const username = user ? user.name.trim() || email : undefined;

  const toggleOpen = () => {
    setOpen((isOpen) => !isOpen);
  };

  const closeMenu = React.useCallback(() => {
    setOpen(false);
  }, []);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname;
      closeMenu();
    }
  }, [closeMenu, pathname]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, open]);

  React.useEffect(() => {
    if (!isMobile && open) {
      closeMenu();
    }
  }, [closeMenu, isMobile, open]);

  return (
    <>
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="group flex cursor-pointer flex-col items-center justify-center gap-1 rounded-full md:hidden"
        onClick={toggleOpen}
        size="icon-sm"
        variant="outline"
      >
        <div
          className={cn(
            "h-0.5 w-3.5 bg-foreground transition-transform duration-200",
            open && "translate-y-0.75 scale-105 -rotate-45",
          )}
        />
        <div
          className={cn(
            "h-0.5 w-3.5 bg-foreground transition-transform duration-200",
            open && "-translate-y-0.75 scale-105 rotate-45",
          )}
        />
      </Button>
      {isMounted
        ? createPortal(
            <div
              aria-hidden={!open}
              className={cn(
                "fixed inset-x-0 top-12 bottom-0 z-50 overflow-y-auto bg-background transition duration-200 ease-out-quint motion-reduce:transition-none",
                open
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0 duration-150",
              )}
              id="mobile-menu"
              inert={!open}
            >
              <ul className="p-2.5 pt-4">
                {SITE_ROUTES.map((route) => {
                  if (
                    route.isAdmin &&
                    (isPreview ? previewRole : user?.role) !== "admin"
                  ) {
                    return null;
                  }
                  return (
                    <li className={ITEM_CLASS} key={route.href}>
                      <Link
                        href={route.href}
                        onClick={
                          pathname === route.href ? closeMenu : undefined
                        }
                        prefetch
                      >
                        {route.label}
                      </Link>
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
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
