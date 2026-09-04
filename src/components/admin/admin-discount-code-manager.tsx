"use client";

import {
  IconCopy,
  IconMail,
  IconMailForward,
  IconTicket,
} from "@tabler/icons-react";
import { useAction, useQuery } from "convex/react";
import { useId, useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const discountOptions = [
  {
    caption: "Renews at $50 every month, for life.",
    label: "$50/month",
    value: "fifty_monthly",
  },
  {
    caption: "No charge, ever.",
    label: "Free forever",
    value: "free_forever",
  },
] as const;

const deliveryOptions = [
  {
    caption: "Copy the code and send it to anyone. Redeemable once.",
    icon: IconCopy,
    label: "Copy a code",
    value: "generate",
  },
  {
    caption: "Locked to one address and applied at checkout automatically.",
    icon: IconMail,
    label: "Send by email",
    value: "email",
  },
] as const;

type DiscountType = (typeof discountOptions)[number]["value"];
type Delivery = (typeof deliveryOptions)[number]["value"];

const microLabel = "text-xs font-medium text-muted-foreground uppercase";

function offerLabel(discountType: DiscountType) {
  return (
    discountOptions.find((option) => option.value === discountType)?.label ??
    discountType
  );
}

/**
 * A native radio group styled as a segmented control. Arrow keys move between
 * options for free, and the checked state drives the visuals via `has-checked`.
 */
function SegmentedField<T extends string>({
  disabled,
  label,
  name,
  onChange,
  options,
  value,
}: {
  disabled?: boolean;
  label: string;
  name: string;
  onChange: (value: T) => void;
  options: readonly {
    caption: string;
    icon?: typeof IconCopy;
    label: string;
    value: T;
  }[];
  value: T;
}) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selected = options[selectedIndex] ?? options[0];

  return (
    <fieldset className="min-w-0 space-y-2" disabled={disabled}>
      <legend className={cn(microLabel, "mb-2")}>{label}</legend>
      <div className="relative grid grid-flow-col auto-cols-fr rounded-lg bg-muted p-[3px] has-disabled:opacity-50">
        {/* Sliding pill. Sits under the labels and moves to the checked option. */}
        <div
          aria-hidden
          className="absolute inset-y-[3px] left-[3px] rounded-md bg-background shadow-sm ring-1 ring-foreground/10 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none dark:bg-foreground/10 dark:ring-foreground/15"
          style={{
            transform: `translateX(${selectedIndex * 100}%)`,
            width: `calc((100% - 6px) / ${options.length})`,
          }}
        />
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = option.value === value;
          return (
            <label
              className={cn(
                "relative z-[1] flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2 text-sm font-medium whitespace-nowrap transition-[color,scale] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none",
                isSelected
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
                "has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                "has-disabled:cursor-not-allowed",
              )}
              key={option.value}
            >
              <input
                checked={isSelected}
                className="sr-only"
                name={name}
                onChange={() => onChange(option.value)}
                type="radio"
                value={option.value}
              />
              {Icon ? (
                <Icon
                  aria-hidden
                  className={cn(
                    "size-4 shrink-0 transition-colors duration-150",
                    isSelected && "text-primary",
                  )}
                />
              ) : null}
              {option.label}
            </label>
          );
        })}
      </div>
      <p
        className="text-xs text-muted-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
        key={selected.value}
      >
        {selected.caption}
      </p>
    </fieldset>
  );
}

/**
 * Copies a freshly generated code. The clipboard call runs after a network
 * round-trip, so the user activation may have expired; when it has, the toast
 * offers a Copy button that runs inside a real click instead.
 */
async function copyIssuedCode(code: string, offer: string) {
  try {
    await navigator.clipboard.writeText(code);
    toast.add({
      description: `${code} · ${offer}. Paste it anywhere.`,
      title: "Code copied",
      type: "success",
    });
  } catch {
    toast.add({
      actionProps: {
        children: "Copy",
        onClick: () => {
          void navigator.clipboard.writeText(code).then(
            () =>
              toast.add({
                description: code,
                title: "Code copied",
                type: "success",
              }),
            () =>
              toast.add({
                description:
                  "Select the code in the list and copy it manually.",
                priority: "high",
                timeout: 0,
                title: "Unable to copy",
                type: "error",
              }),
          );
        },
      },
      description: `${code} · ${offer}`,
      timeout: 0,
      title: "Code ready to share",
      type: "success",
    });
  }
}

export function AdminDiscountCodeManager() {
  const discountCodes = useQuery(api.discountCodes.listAdminDiscountCodes);
  const generateDiscountCode = useAction(
    api.discountCodes.generateDiscountCode,
  );
  const revokeDiscountCode = useAction(api.discountCodes.revokeDiscountCode);
  const [discountType, setDiscountType] =
    useState<DiscountType>("fifty_monthly");
  const [delivery, setDelivery] = useState<Delivery>("generate");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<Id<"discountCodes"> | null>(
    null,
  );
  const emailId = useId();

  const isPending = Boolean(pendingAction);
  const offer = offerLabel(discountType);

  const issueCode = async () => {
    if (pendingAction) {
      return;
    }

    setPendingAction(delivery);

    try {
      const result = await generateDiscountCode({
        discountType,
        ...(delivery === "email" ? { recipientEmail } : {}),
      });
      const issuedOffer = offerLabel(result.discountType);

      setHighlightId(result.discountCodeId);

      if (result.deliveryStatus === "sent") {
        setRecipientEmail("");
        toast.add({
          description: `${issuedOffer} offer emailed to ${result.recipientEmail}.`,
          title: "Offer sent",
          type: "success",
        });
      } else if (result.deliveryStatus === "failed") {
        toast.add({
          description: `The offer for ${result.recipientEmail} is active, but the email could not be delivered. Let them know another way.`,
          priority: "high",
          timeout: 0,
          title: "Email not delivered",
          type: "warning",
        });
      } else {
        await copyIssuedCode(result.code, issuedOffer);
      }
    } catch (error) {
      toast.add({
        description:
          error instanceof Error
            ? error.message
            : "Unable to issue this discount code.",
        priority: "high",
        timeout: 0,
        title: "Unable to issue code",
        type: "error",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleRevoke = async (
    discountCodeId: Id<"discountCodes">,
    code: string,
  ) => {
    if (pendingAction) {
      return;
    }

    setPendingAction(discountCodeId);

    try {
      await revokeDiscountCode({ discountCodeId });
      if (highlightId === discountCodeId) {
        setHighlightId(null);
      }
      toast.add({
        description: `${code} can no longer be used.`,
        title: "Code revoked",
        type: "success",
      });
    } catch (error) {
      toast.add({
        description:
          error instanceof Error
            ? error.message
            : "Unable to revoke this discount code.",
        priority: "high",
        timeout: 0,
        title: `Unable to revoke ${code}`,
        type: "error",
      });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <section aria-labelledby="discount-codes-heading">
      <Card className="py-0 shadow-sm">
        <CardHeader className="px-4 pt-4 md:px-5 md:pt-5">
          <CardTitle
            className="flex items-center gap-2"
            id="discount-codes-heading"
          >
            <IconTicket aria-hidden className="size-5" stroke={2} />
            Discount codes
          </CardTitle>
          <CardDescription>
            Issue a one-use Stripe offer as a shareable code or send it straight
            to someone&apos;s inbox.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <form
            className="space-y-5 px-4 py-4 md:px-5 md:py-5"
            onSubmit={(event) => {
              event.preventDefault();
              void issueCode();
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              <SegmentedField
                disabled={isPending}
                label="Offer"
                name="discountType"
                onChange={setDiscountType}
                options={discountOptions}
                value={discountType}
              />
              <SegmentedField
                disabled={isPending}
                label="Delivery"
                name="delivery"
                onChange={setDelivery}
                options={deliveryOptions}
                value={delivery}
              />
            </div>

            {delivery === "email" ? (
              <div className="space-y-2" key="email">
                <label className={microLabel} htmlFor={emailId}>
                  Recipient
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    autoComplete="email"
                    className="sm:max-w-sm"
                    disabled={isPending}
                    id={emailId}
                    name="recipientEmail"
                    onChange={(event) => setRecipientEmail(event.target.value)}
                    placeholder="member@example.com"
                    required
                    type="email"
                    value={recipientEmail}
                  />
                  <Button
                    className="w-full sm:w-fit"
                    disabled={isPending}
                    type="submit"
                  >
                    {pendingAction === "email" ? (
                      <Spinner data-icon="inline-start" />
                    ) : (
                      <IconMailForward aria-hidden data-icon="inline-start" />
                    )}
                    {pendingAction === "email"
                      ? "Sending…"
                      : `Send ${offer} offer`}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
                key="generate"
              >
                <Button
                  className="w-full sm:w-fit"
                  disabled={isPending}
                  type="submit"
                >
                  {pendingAction === "generate" ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <IconTicket aria-hidden data-icon="inline-start" />
                  )}
                  {pendingAction === "generate"
                    ? "Generating…"
                    : `Generate ${offer} code`}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Copied to your clipboard the moment it&apos;s created.
                </p>
              </div>
            )}
          </form>

          <AdminDiscountCodeLedger
            discountCodes={discountCodes}
            highlightId={highlightId}
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
