import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <ReactQueryDevtools />
        <HydrateClient>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            {children}
          </ThemeProvider>
        </HydrateClient>
      </TRPCReactProvider>
    </NuqsAdapter>
  );
}
