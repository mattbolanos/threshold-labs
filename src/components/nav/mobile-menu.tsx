"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { SITE_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import { getInitials, LogOutButton } from "./nav-user";

const ITEM_CLASS =
  "hover:bg-accent text-muted-foreground hover:text-foreground flex h-13 cursor-pointer items-center rounded-md px-2.5 text-base transition-colors duration-100";

export function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const user = useQuery(api.auth.getCurrentUser);
  const email = user?.email.trim();
  const username = user ? user.name.trim() || email : undefined;

  const toggleOpen = () => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = open ? "scroll" : "hidden";
    }
    setOpen(!open);
  };

  React.useEffect(() => {
    if (!isMobile && open) {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "scroll";
      }
      setOpen(false);
    }
  }, [isMobile, open]);

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
            "bg-foreground h-0.5 w-3.5 transition-transform duration-200",
            open && "translate-y-0.75 scale-105 -rotate-45",
          )}
        />
        <div
          className={cn(
            "bg-foreground h-0.5 w-3.5 transition-transform duration-200",
            open && "-translate-y-0.75 scale-105 rotate-45",
          )}
        />
      </Button>
      {open && (
        <div
          className="bg-background animate-in fade-out fixed top-0 left-0 z-50 mt-12.5 min-h-screen w-full overflow-y-auto transition-opacity duration-200"
          id="mobile-menu"
        >
          <ul className="p-2.5 pt-4">
            <li className={ITEM_CLASS}>
              <Link href="/">Home Page</Link>
            </li>
            {SITE_ROUTES.map((route) => {
              if (route.isAdmin && user?.role !== "admin") {
                return null;
              }
              return (
                <li className={ITEM_CLASS} key={route.href}>
                  <Link href={route.href} prefetch>
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
                    <span className="text-muted-foreground truncate text-xs">
                      {email}
                    </span>
                  </div>
                </li>
                <li className="px-2.5 py-1.5">
                  <LogOutButton
                    className="h-10 text-base"
                    onLoggedOut={() => {
                      document.body.style.overflow = "scroll";
                      setOpen(false);
                    }}
                  />
                </li>
              </>
            ) : null}
          </ul>
        </div>
      )}
    </>
  );
}
