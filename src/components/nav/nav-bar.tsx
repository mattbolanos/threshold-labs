import Image from "next/image";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { SITE_ROUTES } from "@/lib/routes";
import { NavUser } from "./nav-user";

export function NavBar() {
  return (
    <header className="bg-background sticky top-0 z-10 border-b px-4 md:px-6">
      <div className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between gap-4 md:h-14">
        <div className="flex items-center gap-6">
          <Link href="/">
            <Image
              alt="Threshold Lab"
              height={100}
              src="/logo.svg"
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
                    <Link href={link.href}>{link.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <NavUser
          imageUrl="/stephen-avatar.jpg"
          initials="SP"
          username="Stephen Pelkofer"
        />
      </div>
    </header>
  );
}
