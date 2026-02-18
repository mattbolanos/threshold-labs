"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import type { Preloaded } from "convex/react";
import { redirect } from "next/navigation";
import type { api } from "../../../convex/_generated/api";

interface AdminParentProps {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
}

export const AdminParent = ({ preloadedUserQuery }: AdminParentProps) => {
  const user = usePreloadedAuthQuery(preloadedUserQuery);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <div>
      <div>{JSON.stringify(user)}</div>
    </div>
  );
};
