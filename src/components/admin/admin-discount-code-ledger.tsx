"use client";

import {
  IconClock,
  IconMail,
  IconTicket,
  IconUserCheck,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { CopyCodeButton } from "@/components/admin/copy-code-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function offerLabel(discountType: Doc<"discountCodes">["discountType"]) {
  return discountType === "free_forever" ? "Free forever" : "$50/month";
}

function statusBadge(status: Doc<"discountCodes">["status"]) {
  if (status === "active") {
    return <Badge variant="accent">Ready to redeem</Badge>;
  }
  if (status === "redeemed") {
    return <Badge>Redeemed</Badge>;
  }
  if (status === "provisioning") {
    return <Badge variant="outline">Provisioning</Badge>;
  }
  if (status === "failed") {
    return <Badge variant="destructive">Creation failed</Badge>;
  }
  return <Badge variant="outline">Revoked</Badge>;
}

function DeliverySummary({ code }: { code: Doc<"discountCodes"> }) {
  if (code.recipientEmail) {
    if (code.deliveryStatus === "sent") {
      return (
        <span>
          Sent to <strong>{code.recipientEmail}</strong>
          {code.deliveredAt
            ? ` on ${dateFormatter.format(code.deliveredAt)}`
            : ""}
        </span>
      );
    }
    if (code.deliveryStatus === "failed") {
      return (
        <span title={code.deliveryError}>
          Email to <strong>{code.recipientEmail}</strong> failed
          {code.status === "active"
            ? "; the offer still applies when they check out with that address."
            : "."}
        </span>
      );
    }
    return (
      <span>
        Email to <strong>{code.recipientEmail}</strong> is pending.
      </span>
    );
  }

  return <span>Shared manually, not emailed.</span>;
}

function RedemptionSummary({ code }: { code: Doc<"discountCodes"> }) {
  if (code.status === "redeemed") {
    return (
      <span>
        Redeemed by{" "}
        <strong>{code.redeemedByEmail ?? "email unavailable"}</strong>
        {code.redeemedAt ? ` on ${dateFormatter.format(code.redeemedAt)}` : ""}
      </span>
    );
  }
  if (code.status === "revoked") {
    return (
      <span>
        Revoked
        {code.revokedAt ? ` on ${dateFormatter.format(code.revokedAt)}` : ""}
      </span>
    );
  }
  if (code.status === "failed") {
    return <span>{code.failureReason ?? "Stripe code creation failed."}</span>;
  }
  return <span>Not yet redeemed.</span>;
}

type RevokeTarget = Pick<
  Doc<"discountCodes">,
  "_id" | "code" | "recipientEmail"
>;

export function AdminDiscountCodeLedger({
  discountCodes,
  highlightId,
  onRevoke,
  pendingAction,
}: {
  discountCodes: Doc<"discountCodes">[] | undefined;
  highlightId: Id<"discountCodes"> | null;
  onRevoke: (discountCodeId: Id<"discountCodes">, code: string) => void;
  pendingAction: string | null;
}) {
  const [revokeTarget, setRevokeTarget] = useState<RevokeTarget | null>(null);

  const activeCount =
    discountCodes?.filter((code) => code.status === "active").length ?? 0;

  return (
    <div className="border-t">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 pt-4 pb-3 md:px-5 md:pt-5">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Issued codes</h3>
          {discountCodes && discountCodes.length > 0 ? (
            <Badge className="tabular-nums" variant="outline">
              {activeCount} active
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          Where each code went and who redeemed it.
        </p>
      </div>

      {discountCodes === undefined ? (
        <div className="divide-y border-t">
          {["first", "second"].map((key) => (
            <div className="space-y-2.5 px-4 py-4 md:px-5" key={key}>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-5 w-24 rounded-4xl" />
              </div>
              <Skeleton className="h-3 w-56" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      ) : null}

      {discountCodes?.length === 0 ? (
        <Empty className="mx-4 mb-4 w-auto border md:mx-5 md:mb-5">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconTicket aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No discount codes yet</EmptyTitle>
            <EmptyDescription>
              Codes you generate or send will be listed here with their delivery
              and redemption status.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {discountCodes && discountCodes.length > 0 ? (
        <ul className="divide-y border-t">
          {discountCodes.map((discountCode) => {
            const isRevoking = pendingAction === discountCode._id;
            const isHighlighted = highlightId === discountCode._id;
            const isActive = discountCode.status === "active";

            return (
              <li
                className={cn(
                  "flex min-w-0 flex-col gap-3 px-4 py-4 transition-colors duration-500 md:flex-row md:items-center md:justify-between md:px-5",
                  isHighlighted && "bg-primary/5",
                  !isActive && "text-muted-foreground",
                )}
                key={discountCode._id}
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <code
                      className={cn(
                        "rounded-md bg-muted px-2 py-1 font-mono text-sm font-semibold tracking-wide tabular-nums select-all",
                        isActive
                          ? "text-foreground"
                          : "line-through decoration-muted-foreground/60",
                      )}
                    >
                      {discountCode.code}
                    </code>
                    {statusBadge(discountCode.status)}
                    <Badge variant="outline">
                      {offerLabel(discountCode.discountType)}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-start gap-1.5">
                      <IconMail
                        aria-hidden
                        className="mt-0.5 size-3.5 shrink-0"
                      />
                      <DeliverySummary code={discountCode} />
                    </p>
                    <p className="flex items-start gap-1.5">
                      <IconUserCheck
                        aria-hidden
                        className="mt-0.5 size-3.5 shrink-0"
                      />
                      <RedemptionSummary code={discountCode} />
                    </p>
                    <p className="flex items-start gap-1.5">
                      <IconClock
                        aria-hidden
                        className="mt-0.5 size-3.5 shrink-0"
                      />
                      <span>
                        Created {dateFormatter.format(discountCode.createdAt)}
                      </span>
                    </p>
                  </div>
                </div>

                {isActive ? (
                  <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                    {discountCode.recipientEmail ? null : (
                      <CopyCodeButton code={discountCode.code} />
                    )}
                    <Button
                      aria-label={`Revoke ${discountCode.code}`}
                      disabled={Boolean(pendingAction)}
                      onClick={() => setRevokeTarget(discountCode)}
                      size="sm"
                      type="button"
                      variant="destructive"
                    >
                      {isRevoking ? (
                        <Spinner data-icon="inline-start" />
                      ) : (
                        <IconX aria-hidden data-icon="inline-start" />
                      )}
                      {isRevoking ? "Revoking…" : "Revoke"}
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setRevokeTarget(null);
          }
        }}
        open={revokeTarget !== null}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke {revokeTarget?.code}?</DialogTitle>
            <DialogDescription>
              {revokeTarget?.recipientEmail
                ? `The offer for ${revokeTarget.recipientEmail} stops working immediately and cannot be reactivated.`
                : "The code stops working immediately and cannot be reactivated."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              onClick={() => {
                if (revokeTarget) {
                  onRevoke(revokeTarget._id, revokeTarget.code);
                }
                setRevokeTarget(null);
              }}
              type="button"
              variant="destructive"
            >
              <IconX aria-hidden data-icon="inline-start" />
              Revoke code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
