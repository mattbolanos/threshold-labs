"use client";
import { useQuery } from "convex/react";
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
    <header className="bg-background/95 border-border/80 sticky top-0 z-40 w-full border-b backdrop-blur-sm">
      <nav className="route-padding-x mx-auto flex h-12 w-full max-w-7xl items-center justify-between gap-4 md:h-14">
        <div className="flex items-center gap-6">
          <Link
            aria-label="Threshold Lab home"
            className="group/brand flex items-center gap-2"
            href="/"
            prefetch
          >
            <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md text-xs font-bold">
              TL
            </span>
            <span className="text-foreground text-sm font-bold">
              THRESHOLD LAB
            </span>
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
                      className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-in-out"
                      render={<Link href={link.href} prefetch />}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <NavUser user={user} />
        {/* mobile */}
        <MobileMenu />
      </nav>
    </header>
  );
}
