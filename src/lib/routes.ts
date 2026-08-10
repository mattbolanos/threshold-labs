import type { Route } from "next";

interface SiteRoute {
  href: Route;
  label: string;
  isAdmin?: boolean;
}

export const SITE_ROUTES: SiteRoute[] = [
  { href: "/lab-notes", label: "Lab Notes" },
  { href: "/training", label: "Training" },
  { href: "/admin", isAdmin: true, label: "Admin" },
];
