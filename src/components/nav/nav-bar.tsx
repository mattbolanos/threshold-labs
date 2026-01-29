import Image from "next/image";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { SITE_ROUTES } from "@/lib/routes";
import { MobileMenu } from "./mobile-menu";
import { NavUser } from "./nav-user";

export function NavBar() {
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
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
            <NavigationMenuList className="gap-2">
              {SITE_ROUTES.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    asChild
                    className="text-muted-foreground hover:text-primary transition-color py-1.5 font-medium duration-150 ease-in-out"
                  >
                    <Link href={link.href} prefetch>
                      {link.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
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
