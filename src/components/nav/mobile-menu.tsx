"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import * as React from "react";
import { ThemeToggle } from "@/components/theme/toggle";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { SITE_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";

const ITEM_CLASS =
  "hover:bg-accent text-muted-foreground hover:text-foreground flex h-13 cursor-pointer items-center rounded-md px-2.5 text-base transition-colors duration-100";

export function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const user = useQuery(api.auth.getCurrentUser);

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
        className="group flex cursor-pointer flex-col items-center justify-center gap-1 rounded-full md:hidden"
        onMouseDown={toggleOpen}
        size="icon-sm"
        variant="outline"
      >
        <div
          className={cn(
            "bg-foreground h-0.5 w-[14px] transition-transform duration-200",
            open && "translate-y-[3px] scale-105 -rotate-45",
          )}
        />
        <div
          className={cn(
            "bg-foreground h-0.5 w-[14px] transition-transform duration-200",
            open && "-translate-y-[3px] scale-105 rotate-45",
          )}
        />
      </Button>
      {open && (
        <div className="bg-background animate-in fade-out fixed top-0 left-0 z-[99] mt-12.5 min-h-screen w-full overflow-y-auto transition-opacity duration-200">
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

            <li
              className={cn(
                ITEM_CLASS,
                "hover:text-muted-foreground focus:text-muted-foreground cursor-default justify-between hover:bg-transparent focus:bg-transparent",
              )}
            >
              <span>Theme</span>
              <ThemeToggle />
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
