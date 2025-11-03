import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <TooltipProvider delayDuration={400}>
        <TRPCReactProvider>
          <ReactQueryDevtools />
          <HydrateClient>{children}</HydrateClient>
        </TRPCReactProvider>
      </TooltipProvider>
    </NuqsAdapter>
  );
}
