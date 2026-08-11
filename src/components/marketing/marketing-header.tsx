import {
  IconArrowDown,
  IconFlask,
  IconLogin2,
  IconMenu2,
} from "@tabler/icons-react";
import Link from "next/link";
import { isAppAuthenticated } from "@/lib/auth";
import { marketingNav } from "@/lib/marketing-content";

export async function MarketingHeader() {
  const isLoggedIn = await isAppAuthenticated();
  const accountHref = isLoggedIn ? "/lab/lab-notes" : "/login";
  const accountLabel = isLoggedIn ? "Open Lab" : "Sign in";

  return (
    <header className="sticky top-3 z-50 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between rounded-full border border-lime-300/20 bg-neutral-950/90 px-3 shadow-2xl backdrop-blur-xl sm:px-4">
        <Link
          aria-label="Threshold Lab home"
          className="flex items-center gap-2.5"
          href="/"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-lime-300 text-sm font-black text-neutral-950">
            TL
          </span>
          <span className="text-sm font-bold tracking-tight text-white sm:text-base">
            Threshold Lab
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-5 xl:flex">
          {marketingNav.map((item) => (
            <a
              className="text-sm font-medium text-neutral-400 transition-colors hover:text-lime-300"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-full border border-lime-300/30 bg-neutral-900 px-4 text-sm font-bold text-white transition-colors hover:border-lime-300/60 hover:bg-neutral-800 hover:text-lime-300 active:scale-96"
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
            className="inline-flex h-10 items-center gap-2 rounded-full bg-lime-300 px-4 text-sm font-bold text-neutral-950 transition-colors hover:bg-lime-200 active:scale-96"
            href="/#work-with-me"
          >
            Find your fit
            <IconArrowDown aria-hidden className="size-4" />
          </a>
        </div>

        <details className="group relative xl:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-lime-300/25 text-white">
            <IconMenu2 aria-hidden className="size-5" />
            <span className="sr-only">Open navigation</span>
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute top-12 right-0 flex w-64 flex-col gap-1 rounded-2xl border border-lime-300/20 bg-neutral-950 p-2 shadow-2xl"
          >
            {marketingNav.map((item) => (
              <a
                className="rounded-xl px-4 py-3 text-sm font-medium text-neutral-200 hover:bg-neutral-900"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </a>
            ))}
            <Link
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-3 text-center text-sm font-bold text-neutral-950 active:scale-96"
              href={accountHref}
            >
              {isLoggedIn ? (
                <IconFlask aria-hidden className="size-4" />
              ) : (
                <IconLogin2 aria-hidden className="size-4" />
              )}
              {accountLabel}
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
