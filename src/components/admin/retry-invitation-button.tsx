"use client";

import { useAction } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export function RetryInvitationButton({
  discountCodeId,
}: {
  discountCodeId: Id<"discountCodes">;
}) {
  const retry = useAction(api.memberTransitions.retryInvitation);
  const [pending, setPending] = useState(false);
  return (
    <Button
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await retry({ discountCodeId });
        } catch {
          toast.add({ title: "Unable to retry invitation", type: "error" });
        } finally {
          setPending(false);
        }
      }}
      size="sm"
      variant="outline"
    >
      {pending ? "Retrying…" : "Retry email"}
    </Button>
  );
}
