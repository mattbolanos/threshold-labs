import type { Route } from "next";

interface SiteRoute {
  href: Route;
  label: string;
}

export const SITE_ROUTES: SiteRoute[] = [
  { href: "/", label: "Home" },
  { href: "/partnerships", label: "Partnerships" },
  { href: "/news", label: "Newsletter" },
  { href: "/lab", label: "The Lab" },
];
