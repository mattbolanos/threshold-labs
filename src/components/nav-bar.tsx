import Link from "next/link";
import { SITE_ROUTES } from "@/lib/routes";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";

export function NavBar() {
  return (
    <header className="bg-background sticky top-0 z-10 border-b px-4 md:px-6">
      <div className="flex h-12 items-center justify-between gap-4 md:h-14">
        {/* Navigation menu */}
        <NavigationMenu className="max-md:hidden">
          <NavigationMenuList className="gap-2">
            {SITE_ROUTES.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink
                  asChild
                  className="text-muted-foreground hover:text-primary py-1.5 font-medium"
                >
                  <Link href={link.href}>{link.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
