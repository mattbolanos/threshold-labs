import { IconArrowDown, IconFlask, IconLogin2 } from "@tabler/icons-react";
import Link from "next/link";
import { isAppAuthenticated } from "@/lib/auth";
import { marketingNav } from "@/lib/marketing-content";
import { MarketingMobileMenu } from "./marketing-mobile-menu";

export async function MarketingHeader() {
  const isLoggedIn = await isAppAuthenticated();
  const accountHref = isLoggedIn ? "/lab/lab-notes" : "/login";
  const accountLabel = isLoggedIn ? "Open Lab" : "Sign in";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/15 bg-neutral-950/90 backdrop-blur-xl">
      <div className="route-padding-x mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-6 px-5">
        <Link
          aria-label="Threshold Lab home"
          className="group/brand flex shrink-0 items-center gap-2"
          href="/"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-neutral-950 transition-transform duration-150 group-hover/brand:scale-105">
            TL
          </span>
          <span className="text-sm font-bold text-white">THRESHOLD LAB</span>
        </Link>

        <nav
          aria-label="Main"
          className="mx-auto hidden items-center gap-1 xl:flex"
        >
          {marketingNav.map((item) => (
            <a
              className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-400 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <Link
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-primary/30 bg-neutral-900 px-3 text-sm font-semibold text-white transition duration-150 hover:border-primary/60 hover:bg-neutral-800 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-96"
            href={accountHref}
          >
            {isLoggedIn ? (
              <IconFlask aria-hidden className="size-4" />
            ) : (
              <IconLogin2 aria-hidden className="size-4" />
            )}
            {accountLabel}
          </Link>
          <a
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-neutral-950 transition duration-150 hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-96"
            href="/#work-with-me"
          >
            Find your fit
            <IconArrowDown aria-hidden className="size-4" />
          </a>
        </div>

        <MarketingMobileMenu
          accountHref={accountHref}
          accountLabel={accountLabel}
          isLoggedIn={isLoggedIn}
        />
      </div>
    </header>
  );
}
