"use client";

import {
  IconAlertCircle,
  IconCheck,
  IconLoader2,
  IconMail,
  IconTicket,
} from "@tabler/icons-react";
import { useAction, useQuery } from "convex/react";
import { useState } from "react";
import { AdminDiscountCodeLedger } from "@/components/admin/admin-discount-code-ledger";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const discountOptions = [
  {
    description: "The subscription renews at exactly $50 each month.",
    label: "$50/month",
    value: "fifty_monthly",
  },
  {
    description: "The subscription receives a permanent 100% discount.",
    label: "Free forever",
    value: "free_forever",
  },
] as const;

type DiscountType = (typeof discountOptions)[number]["value"];

export function AdminDiscountCodeManager() {
  const discountCodes = useQuery(api.discountCodes.listAdminDiscountCodes);
  const generateDiscountCode = useAction(
    api.discountCodes.generateDiscountCode,
  );
  const revokeDiscountCode = useAction(api.discountCodes.revokeDiscountCode);
  const [discountType, setDiscountType] =
    useState<DiscountType>("fifty_monthly");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedOffer =
    discountOptions.find((option) => option.value === discountType) ??
    discountOptions[0];

  const issueCode = async (delivery: "email" | "generate") => {
    if (pendingAction) {
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setPendingAction(delivery);

    try {
      const result = await generateDiscountCode({
        discountType,
        ...(delivery === "email" ? { recipientEmail } : {}),
      });

      if (result.deliveryStatus === "failed") {
        setErrorMessage(
          `${result.code} is active, but the email could not be delivered. Copy it from the ledger and share it manually.`,
        );
      } else if (result.deliveryStatus === "sent") {
        setStatusMessage(
          `${result.code} was sent to ${result.recipientEmail}.`,
        );
        setRecipientEmail("");
      } else {
        setStatusMessage(`${result.code} is ready to copy and share.`);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to issue this discount code.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleRevoke = async (
    discountCodeId: Id<"discountCodes">,
    code: string,
  ) => {
    if (
      pendingAction ||
      !window.confirm(
        `Revoke ${code}? It will stop working immediately and cannot be reactivated.`,
      )
    ) {
      return;
    }

    setErrorMessage(null);
    setStatusMessage(null);
    setPendingAction(discountCodeId);

    try {
      await revokeDiscountCode({ discountCodeId });
      setStatusMessage(`${code} was revoked and can no longer be used.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to revoke this discount code.",
      );
    } finally {
      setPendingAction(null);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setErrorMessage(null);
      setStatusMessage(`${code} copied to the clipboard.`);
    } catch {
      setErrorMessage("Unable to copy the code. Select and copy it manually.");
    }
  };

  return (
    <section aria-labelledby="discount-codes-heading" className="space-y-4">
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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2"
            id="discount-codes-heading"
          >
            <IconTicket aria-hidden className="size-5" stroke={2} />
            Discount codes
          </CardTitle>
          <CardDescription>
            Generate a one-use Stripe code to copy, or create one and email it
            directly. The first member to redeem the code receives the offer.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="discount-offer">
              Offer
            </label>
            <Select
              disabled={Boolean(pendingAction)}
              id="discount-offer"
              items={discountOptions}
              onValueChange={(value) => {
                if (value) {
                  setDiscountType(value as DiscountType);
                }
              }}
              value={discountType}
            >
              <SelectTrigger className="min-h-9 w-full sm:max-w-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Discount</SelectLabel>
                  {discountOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedOffer.description}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <form
              className="flex flex-col justify-between gap-4 rounded-xl border bg-muted/30 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void issueCode("generate");
              }}
            >
              <div>
                <h3 className="font-medium">Generate a code</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create it now, then copy and share it yourself.
                </p>
              </div>
              <Button
                className="w-full sm:w-fit"
                disabled={Boolean(pendingAction)}
                type="submit"
              >
                {pendingAction === "generate" ? (
                  <IconLoader2 aria-hidden className="animate-spin" />
                ) : (
                  <IconTicket aria-hidden />
                )}
                {pendingAction === "generate" ? "Generating…" : "Generate"}
              </Button>
            </form>

            <form
              className="space-y-4 rounded-xl border bg-muted/30 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void issueCode("email");
              }}
            >
              <div>
                <h3 className="font-medium">Send by email</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a new code and send instructions through Resend.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="code-email">
                  Recipient email
                </label>
                <Input
                  autoComplete="email"
                  disabled={Boolean(pendingAction)}
                  id="code-email"
                  name="recipientEmail"
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  placeholder="member@example.com"
                  required
                  type="email"
                  value={recipientEmail}
                />
              </div>
              <Button
                className="w-full sm:w-fit"
                disabled={Boolean(pendingAction)}
                type="submit"
              >
                {pendingAction === "email" ? (
                  <IconLoader2 aria-hidden className="animate-spin" />
                ) : (
                  <IconMail aria-hidden />
                )}
                {pendingAction === "email" ? "Sending…" : "Generate & send"}
              </Button>
            </form>
          </div>

          <AdminDiscountCodeLedger
            discountCodes={discountCodes}
            onCopy={(code) => void copyCode(code)}
            onRevoke={(discountCodeId, code) =>
              void handleRevoke(discountCodeId, code)
            }
            pendingAction={pendingAction}
          />
        </CardContent>
      </Card>
    </section>
  );
}
