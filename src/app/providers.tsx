"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/theme/theme-provider";
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          {children}
        </ThemeProvider>
      </ConvexBetterAuthProvider>
    </NuqsAdapter>
  );
}
