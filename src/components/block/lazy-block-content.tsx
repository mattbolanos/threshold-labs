"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Render inside the dialog/drawer portal so Markdown loads only when opened.
export const BlockContent = dynamic(
  () => import("./block-content").then((module) => module.BlockContent),
  {
    loading: () => (
      <output
        aria-busy="true"
        aria-label="Loading workout details"
        className="grid gap-3 py-3"
      >
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
      </output>
    ),
  },
);
