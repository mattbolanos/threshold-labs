"use client";
import { useQuery } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { SITE_ROUTES } from "@/lib/routes";
import { api } from "../../../convex/_generated/api";
import { MobileMenu } from "./mobile-menu";
import { NavUser } from "./nav-user";

export function NavBar() {
  const user = useQuery(api.auth.getCurrentUser);

  return (
    <header className="bg-background/95 section-slash sticky top-0 z-40 w-full border-b backdrop-blur-sm">
      <nav className="route-padding-x mx-auto flex h-12 w-full max-w-[var(--max-app-width)] items-center justify-between gap-4 md:h-14">
        <div className="flex items-center gap-6">
          <Link href="/" prefetch>
            <Image
              alt="Threshold Lab"
              className="size-20 md:size-25 dark:hidden"
              height={100}
              src="/wordmark-light.svg"
              width={100}
            />
            <Image
              alt="Threshold Lab"
              className="hidden size-20 md:size-25 dark:block"
              height={100}
              src="/wordmark-dark.svg"
              width={100}
            />
          </Link>
          {/* desktop */}
          <NavigationMenu className="max-md:hidden">
            <NavigationMenuList className="gap-1">
              {SITE_ROUTES.map((link) => {
                if (link.isAdmin && user?.role !== "admin") {
                  return null;
                }
                return (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink
                      asChild
                      className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-in-out"
                    >
                      <Link href={link.href} prefetch>
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <NavUser
          email="stephen@thresholdlab.com"
          imageUrl="/stephen-avatar.jpg"
          initials="SP"
          username="Stephen Pelkofer"
        />
        {/* mobile */}
        <MobileMenu />
      </nav>
    </header>
  );
}
