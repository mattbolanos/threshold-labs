import {
  IconCopy,
  IconLoader2,
  IconMail,
  IconTicket,
  IconUserCheck,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
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
            ? "; the active code is still available to copy."
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

  return <span>Generated without email delivery.</span>;
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

export function AdminDiscountCodeLedger({
  discountCodes,
  onCopy,
  onRevoke,
  pendingAction,
}: {
  discountCodes: Doc<"discountCodes">[] | undefined;
  onCopy: (code: string) => void;
  onRevoke: (discountCodeId: Id<"discountCodes">, code: string) => void;
  pendingAction: string | null;
}) {
  if (discountCodes === undefined) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (discountCodes.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconTicket aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No discount codes</EmptyTitle>
          <EmptyDescription>Generated codes will appear here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium">Code ledger</h3>
        <p className="text-sm text-muted-foreground">
          Delivery records and the Stripe email that actually used each code.
        </p>
      </div>
      <div className="divide-y rounded-xl border">
        {discountCodes.map((discountCode) => {
          const isRevoking = pendingAction === discountCode._id;

          return (
            <div
              className="flex min-w-0 flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
              key={discountCode._id}
            >
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded-md bg-muted px-2 py-1 text-sm font-semibold tracking-wide">
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
                  <p>Created {dateFormatter.format(discountCode.createdAt)}</p>
                </div>
              </div>

              {discountCode.status === "active" ? (
                <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                  <Button
                    aria-label={`Copy ${discountCode.code}`}
                    onClick={() => onCopy(discountCode.code)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <IconCopy aria-hidden />
                    Copy
                  </Button>
                  <Button
                    disabled={Boolean(pendingAction)}
                    onClick={() =>
                      onRevoke(discountCode._id, discountCode.code)
                    }
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    {isRevoking ? (
                      <IconLoader2 aria-hidden className="animate-spin" />
                    ) : (
                      <IconX aria-hidden />
                    )}
                    {isRevoking ? "Revoking…" : "Revoke"}
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
