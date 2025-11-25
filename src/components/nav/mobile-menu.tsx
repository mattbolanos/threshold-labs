"use client";

import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { SITE_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

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
        <div className="animate-in fade-out bg-background fixed inset-0 z-20 mt-12.5 overflow-y-auto transition-opacity duration-200">
          <ul className="p-2 pt-4">
            {SITE_ROUTES.map((route) => (
              <li
                className="hover:bg-accent text-muted-foreground hover:text-foreground flex h-12 cursor-pointer items-center rounded-md px-2.5 text-base transition-colors duration-100"
                key={route.href}
              >
                <Link href={route.href} prefetch>
                  {route.label}
                </Link>
              </li>
            ))}
            <li className="hover:bg-accent text-muted-foreground hover:text-foreground flex h-12 cursor-pointer items-center rounded-md px-2.5 text-base transition-colors duration-100">
              <Link href="/">Home Page</Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
