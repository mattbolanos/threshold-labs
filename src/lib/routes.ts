import type { Route } from "next";

interface SiteRoute {
  href: Route;
  label: string;
  isAdmin?: boolean;
}

export const SITE_ROUTES: SiteRoute[] = [
  { href: "/", label: "Home" },
  { href: "/lab/lab-notes", label: "Lab Notes" },
  { href: "/lab/training", label: "Training" },
  { href: "/lab/admin", isAdmin: true, label: "Admin" },
];
