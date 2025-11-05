import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <ReactQueryDevtools />
        <HydrateClient>{children}</HydrateClient>
      </TRPCReactProvider>
    </NuqsAdapter>
  );
}
