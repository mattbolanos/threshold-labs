"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { IconArrowLeft } from "@tabler/icons-react";
import type { Preloaded } from "convex/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { api } from "../../../convex/_generated/api";
import { AdminClientInviteForm } from "./admin-client-invite-form";

interface AdminAddClientPageProps {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
}

export function AdminAddClientPage({
  preloadedUserQuery,
}: AdminAddClientPageProps) {
  const user = usePreloadedAuthQuery(preloadedUserQuery);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="route-padding-x">
        <Link
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          href="/admin"
        >
          <IconArrowLeft aria-hidden className="size-4" />
          Back to Workouts
        </Link>
      </div>

      <div className="route-padding-x">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
          Access
        </p>
        <h2 className="text-lg font-semibold tracking-tight">Add Client</h2>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Create or update signup invites for clients and coaches.
        </p>
      </div>

      <div className="route-padding-x border-primary/20 relative border-t pt-4">
        <div className="bg-primary/40 absolute top-0 left-5 h-0.5 w-16 md:left-8" />
        <AdminClientInviteForm />
      </div>
    </div>
  );
}
