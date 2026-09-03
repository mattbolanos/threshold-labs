"use client";

import { usePathname } from "next/navigation";
import { Providers } from "@/app/providers";
import { NavBar } from "@/components/nav/nav-bar";
import type { PreviewRole } from "@/lib/auth/preview-role";

const PUBLIC_ROUTES = new Set([
  "/",
  "/auth/continue",
  "/auth/training-archive/success",
  "/login",
  "/my-partnerships",
  "/partnerships",
  "/signup",
  "/subscribe",
  "/unauthorized",
  "/verify-email",
]);

export function SiteShell({
  children,
  initialToken,
  isPreview,
  previewRole,
}: {
  children: React.ReactNode;
  initialToken?: string | null;
  isPreview: boolean;
  previewRole: PreviewRole;
}) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  if (isPublicRoute) {
    return children;
  }

  return (
    <Providers initialToken={initialToken}>
      <NavBar isPreview={isPreview} previewRole={previewRole} />
      <PrivatePage>{children}</PrivatePage>
    </Providers>
  );
}

function PrivatePage({ children }: { children: React.ReactNode }) {
  return (
    <div className="route-padding-y route-padding-x mx-auto w-full max-w-7xl">
      {children}
    </div>
  );
}
