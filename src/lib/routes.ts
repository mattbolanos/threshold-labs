import type { Route } from "next";

interface SiteRoute {
  href: Route;
  label: string;
  isAdmin?: boolean;
  requiresAccess?: boolean;
  requiresFullAccess?: boolean;
}

export const SITE_ROUTES: SiteRoute[] = [
  {
    href: "/lab/lab-notes",
    label: "Lab Notes",
    requiresAccess: true,
    requiresFullAccess: true,
  },
  { href: "/lab/training", label: "Training", requiresAccess: true },
  {
    href: "/lab/training/workouts",
    label: "Workout Library",
    requiresAccess: true,
  },
  { href: "/lab/pricing", label: "Pricing" },
  {
    href: "/lab/admin",
    isAdmin: true,
    label: "Admin",
    requiresAccess: true,
  },
];
