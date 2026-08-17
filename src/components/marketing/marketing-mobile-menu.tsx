"use client";

import { IconArrowDown, IconFlask, IconLogin2 } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { marketingNav } from "@/lib/marketing-content";
import { MarketingContainer } from "./marketing-container";

const MENU_ITEM_CLASS =
  "flex h-13 w-full items-center rounded-md px-2.5 text-base font-medium text-neutral-400 transition-colors duration-100 hover:bg-neutral-900 hover:text-white";

interface MarketingMobileMenuProps {
  accountHref: Route;
  accountLabel: string;
  isLoggedIn: boolean;
}

export function MarketingMobileMenu({
  accountHref,
  accountLabel,
  isLoggedIn,
}: MarketingMobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog modal={false} onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button
            aria-label={open ? "Close menu" : "Open menu"}
            className="group flex size-10 flex-col items-center justify-center gap-1 rounded-full border-primary/25 bg-neutral-950 text-white hover:border-primary/50 hover:bg-neutral-900 xl:hidden"
            size="icon-lg"
            variant="outline"
          />
        }
      >
        <span className="h-0.5 w-4 bg-current transition-transform duration-200 group-data-popup-open:translate-y-0.75 group-data-popup-open:scale-105 group-data-popup-open:-rotate-45" />
        <span className="h-0.5 w-4 bg-current transition-transform duration-200 group-data-popup-open:-translate-y-0.75 group-data-popup-open:scale-105 group-data-popup-open:rotate-45" />
      </DialogTrigger>
      <DialogPortal>
        <DialogPopup className="fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto overscroll-contain bg-neutral-950 transition-opacity duration-200 ease-out-quint outline-none data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:opacity-0 motion-reduce:transition-none xl:hidden">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <nav aria-label="Mobile navigation">
            <MarketingContainer className="w-full p-2.5 pt-4">
              <ul>
                {marketingNav.map((item) => (
                  <li key={item.label}>
                    <a
                      className={MENU_ITEM_CLASS}
                      href={item.href}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid gap-3 px-2.5">
                <Link
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-4 text-base font-semibold text-neutral-950 transition duration-150 hover:bg-primary active:scale-96"
                  href="/#work-with-me"
                  onClick={() => setOpen(false)}
                >
                  Find your fit
                  <IconArrowDown aria-hidden className="size-5" />
                </Link>
                <Link
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-primary/30 bg-neutral-900 px-4 text-base font-semibold text-white transition duration-150 hover:border-primary/60 hover:bg-neutral-800 hover:text-primary active:scale-96"
                  href={accountHref}
                  onClick={() => setOpen(false)}
                >
                  {isLoggedIn ? (
                    <IconFlask aria-hidden className="size-5" />
                  ) : (
                    <IconLogin2 aria-hidden className="size-5" />
                  )}
                  {accountLabel}
                </Link>
              </div>
            </MarketingContainer>
          </nav>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
