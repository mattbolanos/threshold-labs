"use client";

import { IconChevronDown, IconLoader2 } from "@tabler/icons-react";
import { useState } from "react";
import {
  type AdminUser,
  AdminUserAccessDetails,
} from "@/components/admin/admin-user-access-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPurchaseDate, formatTrainingBlockCount } from "@/lib/billing";

export const adminRoleOptions = [
  { label: "Client", value: "client" },
  { label: "Coach", value: "coach" },
  { label: "Admin", value: "admin" },
] as const;

export type AdminUserRole = (typeof adminRoleOptions)[number]["value"];

type UsersTableProps = {
  users: AdminUser[] | undefined;
  pendingUserId: string | null;
  onRoleChange: (user: AdminUser, role: AdminUserRole) => Promise<void>;
};

const accessLabels = {
  admin: "All access",
  none: "No lab access",
  subscription: "Member access",
  training_blocks: "Block access",
};

function MembershipCell({ user }: { user: AdminUser }) {
  const subscription = user.subscription;
  if (!subscription) {
    return <span className="text-muted-foreground">No subscription</span>;
  }
  const periodLabel = subscription.cancelAtPeriodEnd
    ? "Ends"
    : subscription.status === "trialing"
      ? "Trial ends"
      : subscription.status === "active"
        ? "Renews"
        : "Period end";
  return (
    <div className="space-y-1">
      <p className="capitalize">{subscription.status.replaceAll("_", " ")}</p>
      {subscription.periodEnd ? (
        <p className="text-xs text-muted-foreground tabular-nums">
          {periodLabel} {formatPurchaseDate(subscription.periodEnd)}
        </p>
      ) : null}
    </div>
  );
}

function UserTableRow({
  user,
  pendingUserId,
  onRoleChange,
}: Omit<UsersTableProps, "users"> & { user: AdminUser }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = `user-details-${user.id}`;
  return (
    <>
      <TableRow className={expanded ? "bg-muted/30 hover:bg-muted/30" : ""}>
        <TableCell className="px-5 py-3 whitespace-normal">
          <div className="flex items-center gap-2">
            <p className="font-medium wrap-anywhere">
              {user.name || "Unnamed user"}
            </p>
            {user.isCurrentUser ? (
              <span className="text-xs text-muted-foreground">You</span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm wrap-anywhere text-muted-foreground">
            {user.email}
          </p>
          {!user.emailVerified ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Email not verified
            </p>
          ) : null}
        </TableCell>
        <TableCell className="px-4 py-3">
          <Badge
            variant={
              user.accessSource === "none"
                ? "outline"
                : user.accessSource === "subscription"
                  ? "accent"
                  : "secondary"
            }
          >
            {accessLabels[user.accessSource]}
          </Badge>
        </TableCell>
        <TableCell className="px-4 py-3 whitespace-normal">
          {user.purchasedBlockCount > 0 ? (
            <div className="space-y-1">
              <p className="tabular-nums">
                {formatTrainingBlockCount(user.purchasedBlockCount)}
              </p>
              <p
                className="max-w-48 truncate text-xs text-muted-foreground"
                title={user.purchases[0]?.title}
              >
                {user.purchases[0]?.title}
              </p>
            </div>
          ) : (
            <span className="text-muted-foreground">No blocks</span>
          )}
        </TableCell>
        <TableCell className="px-4 py-3">
          <MembershipCell user={user} />
        </TableCell>
        <TableCell className="px-4 py-3">
          <div className="flex items-center gap-2">
            {user.isCurrentUser ? (
              <span
                className="text-sm"
                title="Your own admin role is protected"
              >
                Admin
              </span>
            ) : (
              <Select
                disabled={Boolean(pendingUserId)}
                items={adminRoleOptions}
                onValueChange={(role) => {
                  if (role) void onRoleChange(user, role as AdminUserRole);
                }}
                value={user.role}
              >
                <SelectTrigger
                  aria-label={`Account role for ${user.email}`}
                  className="min-h-10 w-28"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {adminRoleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {pendingUserId === user.id ? (
              <IconLoader2
                aria-label="Saving role"
                className="size-4 shrink-0 text-muted-foreground motion-safe:animate-spin"
              />
            ) : null}
          </div>
        </TableCell>
        <TableCell className="py-3 ps-3 pe-5 text-end">
          <Button
            aria-controls={detailsId}
            aria-expanded={expanded}
            aria-label={`${expanded ? "Hide" : "View"} details for ${user.email}`}
            className="min-h-10"
            onClick={() => setExpanded(!expanded)}
            variant="ghost"
          >
            Details
            <IconChevronDown
              aria-hidden
              className={expanded ? "size-4 rotate-180" : "size-4"}
              stroke={1.5}
            />
          </Button>
        </TableCell>
      </TableRow>
      <TableRow
        className="bg-muted/20 hover:bg-muted/20"
        hidden={!expanded}
        id={detailsId}
      >
        <TableCell className="p-5 whitespace-normal" colSpan={6}>
          {expanded ? <AdminUserAccessDetails user={user} /> : null}
        </TableCell>
      </TableRow>
    </>
  );
}

export function AdminUsersTable({
  users,
  pendingUserId,
  onRoleChange,
}: UsersTableProps) {
  return (
    <div className="border-t">
      <p
        className="px-4 py-2 text-xs text-muted-foreground lg:hidden"
        id="users-table-scroll-hint"
      >
        Scroll horizontally to see all columns.
      </p>
      <section
        aria-label="Registered users"
        className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: Focus enables keyboard scrolling across the table.
        tabIndex={0}
      >
        <table
          aria-busy={users === undefined}
          className="w-full min-w-240 text-sm"
        >
          <caption className="sr-only">
            Registered users, lab access, purchases, membership status, and
            account roles
          </caption>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead
                className="w-1/4 px-5 text-xs text-muted-foreground"
                scope="col"
              >
                User
              </TableHead>
              <TableHead
                className="px-4 text-xs text-muted-foreground"
                scope="col"
              >
                Lab access
              </TableHead>
              <TableHead
                className="px-4 text-xs text-muted-foreground"
                scope="col"
              >
                Purchased blocks
              </TableHead>
              <TableHead
                className="px-4 text-xs text-muted-foreground"
                scope="col"
              >
                Stripe membership
              </TableHead>
              <TableHead
                className="px-4 text-xs text-muted-foreground"
                scope="col"
              >
                Role
              </TableHead>
              <TableHead className="ps-3 pe-5" scope="col">
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users === undefined
              ? ["first", "second", "third"].map((key) => (
                  <TableRow aria-hidden key={key}>
                    <TableCell className="px-5 py-4">
                      <Skeleton className="mb-2 h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </TableCell>
                    {[
                      "access",
                      "purchases",
                      "membership",
                      "role",
                      "details",
                    ].map((column) => (
                      <TableCell className="px-4 py-4" key={column}>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : users.map((user) => (
                  <UserTableRow
                    key={user.id}
                    onRoleChange={onRoleChange}
                    pendingUserId={pendingUserId}
                    user={user}
                  />
                ))}
          </TableBody>
        </table>
      </section>
    </div>
  );
}
