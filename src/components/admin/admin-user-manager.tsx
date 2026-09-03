"use client";

import {
  IconAlertCircle,
  IconCheck,
  IconCreditCard,
  IconLoader2,
  IconShield,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../../convex/_generated/api";

const roleOptions = [
  { label: "Client", value: "client" },
  { label: "Coach", value: "coach" },
  { label: "Admin", value: "admin" },
] as const;

type UserRole = (typeof roleOptions)[number]["value"];

const membershipDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatMembershipStatus(
  subscription: {
    cancelAtPeriodEnd: boolean;
    periodEnd: number | null;
    status: string;
  } | null,
  hasStripeCustomer: boolean,
) {
  if (!subscription) {
    return hasStripeCustomer
      ? "Stripe customer · no subscription"
      : "No Stripe subscription";
  }

  const status = subscription.status.replaceAll("_", " ");
  if (!subscription.periodEnd) {
    return status;
  }

  const date = membershipDateFormatter.format(new Date(subscription.periodEnd));
  if (subscription.cancelAtPeriodEnd) {
    return `${status} · ends ${date}`;
  }

  return subscription.status === "active" || subscription.status === "trialing"
    ? `${status} · renews ${date}`
    : `${status} · period ended ${date}`;
}

function AccessBadge({
  hasTrainingArchive,
  source,
}: {
  hasTrainingArchive: boolean;
  source: "admin" | "none" | "subscription" | "training_archive";
}) {
  if (source === "admin") {
    return (
      <Badge>
        <IconShield aria-hidden data-icon="inline-start" />
        Admin access
      </Badge>
    );
  }

  if (source === "subscription") {
    return (
      <Badge variant="secondary">
        <IconCreditCard aria-hidden data-icon="inline-start" />
        {hasTrainingArchive ? "Member + archive" : "Member access"}
      </Badge>
    );
  }

  if (source === "training_archive") {
    return (
      <Badge variant="secondary">
        <IconCreditCard aria-hidden data-icon="inline-start" />
        Training archive
      </Badge>
    );
  }

  return <Badge variant="outline">No lab access</Badge>;
}

function UsersLoadingState() {
  return (
    <div className="space-y-1 px-4 pb-4 md:px-5 md:pb-5">
      {["first", "second", "third"].map((key) => (
        <div
          className="grid gap-4 py-4 md:grid-cols-3 lg:grid-cols-4"
          key={key}
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

export function AdminUserManager() {
  const users = useQuery(api.auth.listAdminUsers);
  const updateRole = useMutation(api.auth.updateAdminUserRole);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRoleChange = async (
    user: NonNullable<typeof users>[number],
    role: UserRole,
  ) => {
    if (role === user.role || pendingUserId) {
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setPendingUserId(user.id);

    try {
      await updateRole({ role, userId: user.id });
      const roleLabel = roleOptions.find(
        (option) => option.value === role,
      )?.label;
      setStatusMessage(`${user.email} is now ${roleLabel ?? role}.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update this user.",
      );
    } finally {
      setPendingUserId(null);
    }
  };

  return (
    <section aria-labelledby="registered-users-heading" className="space-y-4">
      <div aria-atomic aria-live="polite" className="sr-only">
        {statusMessage || errorMessage || ""}
      </div>

      {errorMessage ? (
        <div
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          <IconAlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {statusMessage ? (
        <output className="flex items-center gap-2 text-sm text-primary">
          <IconCheck aria-hidden className="size-4" />
          <span>{statusMessage}</span>
        </output>
      ) : null}

      <Card className="py-0 shadow-sm">
        <CardHeader className="px-4 pt-4 md:px-5 md:pt-5">
          <CardTitle
            className="flex items-center gap-2"
            id="registered-users-heading"
          >
            <IconUsersGroup aria-hidden className="size-5" stroke={2} />
            Registered users
          </CardTitle>
          <CardDescription>
            Admins bypass billing. Clients and coaches can have full membership
            or training-only archive access.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          {users === undefined ? <UsersLoadingState /> : null}

          {users?.length === 0 ? (
            <Empty className="m-4 w-auto border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <IconUser aria-hidden />
                </EmptyMedia>
                <EmptyTitle>No registered users</EmptyTitle>
                <EmptyDescription>
                  New verified accounts will appear here after signup.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}

          {users && users.length > 0 ? (
            <div className="divide-y">
              {users.map((user) => {
                const isPending = pendingUserId === user.id;

                return (
                  <div
                    className="grid min-w-0 gap-4 px-4 py-4 md:grid-cols-3 md:px-5 lg:grid-cols-4 lg:items-center"
                    key={user.id}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{user.name}</p>
                        {user.isCurrentUser ? (
                          <Badge variant="outline">You</Badge>
                        ) : null}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.emailVerified
                          ? "Verified email"
                          : "Email not verified"}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Lab access
                      </p>
                      <AccessBadge
                        hasTrainingArchive={user.trainingArchive !== null}
                        source={user.accessSource}
                      />
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Stripe membership
                      </p>
                      <p className="text-sm leading-snug capitalize">
                        {formatMembershipStatus(
                          user.subscription,
                          user.hasStripeCustomer,
                        )}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        className="text-xs font-medium text-muted-foreground uppercase"
                        htmlFor={`role-${user.id}`}
                      >
                        Account role
                      </label>
                      <div className="flex items-center gap-2">
                        <Select
                          disabled={
                            user.isCurrentUser || Boolean(pendingUserId)
                          }
                          id={`role-${user.id}`}
                          items={roleOptions}
                          onValueChange={(role) => {
                            if (role) {
                              void handleRoleChange(user, role as UserRole);
                            }
                          }}
                          value={user.role}
                        >
                          <SelectTrigger className="min-h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Role</SelectLabel>
                              {roleOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {isPending ? (
                          <IconLoader2
                            aria-label="Saving role"
                            className="size-4 shrink-0 animate-spin text-muted-foreground"
                          />
                        ) : null}
                      </div>
                      {user.isCurrentUser ? (
                        <p className="text-xs text-muted-foreground">
                          Your own admin role is protected.
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
