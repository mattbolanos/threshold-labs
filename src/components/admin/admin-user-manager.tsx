"use client";

import {
  IconAlertCircle,
  IconCheck,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  type AdminUserRole,
  AdminUsersTable,
  adminRoleOptions,
} from "@/components/admin/admin-users-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../../../convex/_generated/api";

const accessOptions = [
  { label: "Active access", value: "active" },
  { label: "All users", value: "all" },
  { label: "Members", value: "subscription" },
  { label: "Complimentary access", value: "transition" },
  { label: "Block access only", value: "training_blocks" },
  { label: "No lab access", value: "none" },
  { label: "Admins", value: "admin" },
];

export function AdminUserManager() {
  const users = useQuery(api.auth.listAdminUsers);
  const [search, setSearch] = useState("");
  const [accessFilter, setAccessFilter] = useState("active");
  const searchTerm = search.trim().toLowerCase();
  const filteredUsers = users?.filter(
    (user) =>
      (accessFilter === "all" ||
        (accessFilter === "active"
          ? user.accessSource !== "none"
          : user.accessSource === accessFilter)) &&
      [
        user.name,
        user.email,
        ...user.purchases.map((purchase) => purchase.title),
      ].some((value) => value.toLowerCase().includes(searchTerm)),
  );
  const updateRole = useMutation(api.auth.updateAdminUserRole);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRoleChange = async (
    user: NonNullable<typeof users>[number],
    role: AdminUserRole,
  ) => {
    if (role === user.role || pendingUserId) {
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setPendingUserId(user.id);

    try {
      await updateRole({ role, userId: user.id });
      const roleLabel = adminRoleOptions.find(
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
    <section
      aria-labelledby="registered-users-heading"
      className="min-w-0 space-y-4"
    >
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

      <Card className="min-w-0 py-0">
        <CardHeader className="px-4 pt-4 md:px-5 md:pt-5">
          <h2
            className="flex items-center gap-2 text-base font-medium"
            id="registered-users-heading"
          >
            <IconUsersGroup aria-hidden className="size-5" stroke={2} />
            Registered users
          </h2>
          <CardDescription>
            Active access includes members, block owners, and admins. Account,
            membership, and purchase changes appear automatically.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <div className="space-y-3 px-4 pb-4 md:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <label className="text-sm font-medium" htmlFor="user-search">
                  Search users or purchases
                </label>
                <Input
                  className="min-h-11"
                  id="user-search"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, email, or training block"
                  type="search"
                  value={search}
                />
              </div>
              <div className="space-y-1.5 sm:w-52">
                <label
                  className="text-sm font-medium"
                  htmlFor="user-access-filter"
                >
                  Access
                </label>
                <Select
                  items={accessOptions}
                  onValueChange={(value) => value && setAccessFilter(value)}
                  value={accessFilter}
                >
                  <SelectTrigger
                    className="min-h-11 w-full"
                    id="user-access-filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accessOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p
              aria-live="polite"
              className="text-sm text-muted-foreground tabular-nums"
            >
              {users
                ? `${filteredUsers?.length ?? 0} of ${users.length} users · ${users.filter((user) => user.accessSource !== "none").length} with active access`
                : "Loading users…"}
            </p>
          </div>
          {users === undefined ? (
            <AdminUsersTable
              onRoleChange={handleRoleChange}
              pendingUserId={pendingUserId}
              users={undefined}
            />
          ) : null}

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

          {users && users.length > 0 && filteredUsers?.length === 0 ? (
            <Empty className="m-4 w-auto border">
              <EmptyHeader>
                <EmptyTitle>No matching users</EmptyTitle>
                <EmptyDescription>
                  Try another name or show all users to include accounts without
                  lab access.
                </EmptyDescription>
              </EmptyHeader>
              <Button
                onClick={() => {
                  setSearch("");
                  setAccessFilter("all");
                }}
                variant="outline"
              >
                Show all users
              </Button>
            </Empty>
          ) : null}

          {filteredUsers && filteredUsers.length > 0 ? (
            <AdminUsersTable
              onRoleChange={handleRoleChange}
              pendingUserId={pendingUserId}
              users={filteredUsers}
            />
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
