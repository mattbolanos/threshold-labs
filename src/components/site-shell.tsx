"use client";

import { usePathname } from "next/navigation";
import { Providers } from "@/app/providers";
import { NavBar } from "@/components/nav/nav-bar";
import type { PreviewRole } from "@/lib/auth/preview-role";

const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/my-partnerships",
  "/partnerships",
  "/signup",
  "/unauthorized",
]);

export function SiteShell({
  children,
  isPreview,
  previewRole,
}: {
  children: React.ReactNode;
  isPreview: boolean;
  previewRole: PreviewRole;
}) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  if (isPublicRoute) {
    return children;
  }

  return (
    <Providers>
      <NavBar isPreview={isPreview} previewRole={previewRole} />
      <div className="route-padding-y route-padding-x mx-auto w-full max-w-7xl">
        {children}
      </div>
    </Providers>
  );
}
