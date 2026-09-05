import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { isAppAuthenticated } from "@/lib/auth";
import { marketingNav } from "@/lib/marketing-content";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "./marketing-container";
import { MarketingMobileMenu } from "./marketing-mobile-menu";

export async function MarketingHeader() {
  const isLoggedIn = await isAppAuthenticated();
  const accountHref = isLoggedIn ? "/lab/lab-notes" : "/login";
  const accountLabel = isLoggedIn ? "Open Lab" : "Sign in";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/15 bg-neutral-950/90 backdrop-blur-xl">
      <MarketingContainer className="route-padding-x flex h-14 w-full items-center justify-between gap-6 px-5">
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

        <div className="ms-auto hidden items-center gap-4 md:flex">
          <nav aria-label="Main" className="flex items-center gap-2">
            {marketingNav.map((item) => (
              <a
                className="rounded-md px-2 py-1.5 text-sm font-medium text-neutral-400 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Link
            className={cn(
              buttonVariants({ variant: "default" }),
              "rounded-full",
            )}
            href={accountHref}
          >
            {accountLabel}
          </Link>
        </div>

        <MarketingMobileMenu
          accountHref={accountHref}
          accountLabel={accountLabel}
          isLoggedIn={isLoggedIn}
        />
      </MarketingContainer>
    </header>
  );
}
