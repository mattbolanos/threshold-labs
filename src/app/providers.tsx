"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { Analytics } from "@vercel/analytics/next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { authClient } from "@/lib/auth-client";
import { convex } from "./convex-client";

export function Providers({
  children,
  initialToken,
}: {
  children: React.ReactNode;
  initialToken?: string | null;
}) {
  return (
    <NuqsAdapter>
      <ConvexBetterAuthProvider
        authClient={authClient}
        client={convex}
        initialToken={initialToken}
      >
        <Analytics />
        {children}
      </ConvexBetterAuthProvider>
    </NuqsAdapter>
  );
}
