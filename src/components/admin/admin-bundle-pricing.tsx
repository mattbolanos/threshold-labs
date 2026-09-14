"use client";

import { IconStack2 } from "@tabler/icons-react";
import { useAction, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { formatBundlePrice } from "@/lib/billing";
import { parsePriceInput } from "@/lib/price-input";
import { api } from "../../../convex/_generated/api";

export function AdminBundlePricing() {
  const price = useQuery(api.bundlePricing.getAdminPrice);
  return (
    <Card className="py-0 shadow-sm">
      <CardHeader className="gap-2 px-4 pt-4 md:px-5 md:pt-5">
        <CardTitle className="flex items-center gap-2 text-base">
          <IconStack2 aria-hidden className="size-4 text-muted-foreground" />
          Training block bundle
        </CardTitle>
        <CardDescription>
          Set the one-time price for all current training blocks.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4 md:px-5 md:pb-5">
        {price ? (
          <BundlePriceForm price={price} />
        ) : (
          <div aria-busy="true" className="flex flex-col gap-3">
            <output className="sr-only">Loading bundle price…</output>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BundlePriceForm({
  price,
}: {
  price: { amountCents: number; canEdit: boolean; revision: number };
}) {
  const updatePrice = useAction(api.bundlePricingActions.update);
  const inputId = useId();
  const inFlight = useRef(false);
  const [draft, setDraft] = useState<{
    value: string;
    revision: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const value = draft?.value ?? String(price.amountCents / 100);
  const amountCents = parsePriceInput(value);
  const stale = draft !== null && draft.revision !== price.revision;
  const changed = amountCents !== price.amountCents;
  const inputError = value !== "" && amountCents === null;

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      inFlight.current ||
      amountCents === null ||
      !changed ||
      stale ||
      !price.canEdit
    )
      return;
    inFlight.current = true;
    setSaving(true);
    setError(null);
    try {
      const result = await updatePrice({
        amountCents,
        expectedRevision: draft?.revision ?? price.revision,
      });
      setDraft(null);
      toast.add({
        title: `Bundle price updated to ${formatBundlePrice(result.amountCents)}.`,
        type: "success",
      });
    } catch (cause) {
      setError(
        cause instanceof ConvexError && typeof cause.data === "string"
          ? cause.data
          : "The price could not be updated. Please try again.",
      );
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  return (
    <form aria-busy={saving} className="flex flex-col gap-6" onSubmit={save}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {formatBundlePrice(price.amountCents)}
        </p>
        <p className="text-sm text-muted-foreground">
          Current price · one-time payment
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex w-full flex-col gap-2 sm:max-w-60">
            <Label htmlFor={inputId}>New price (USD)</Label>
            <Input
              aria-describedby={`${inputId}-help${inputError || error || stale ? ` ${inputId}-error` : ""}`}
              aria-invalid={inputError || Boolean(error) || stale}
              autoComplete="off"
              className="h-10 text-base tabular-nums"
              disabled={saving || !price.canEdit}
              id={inputId}
              inputMode="decimal"
              onChange={(event) => {
                setDraft({
                  revision: draft?.revision ?? price.revision,
                  value: event.target.value,
                });
                setError(null);
              }}
              required
              value={value}
            />
          </div>
          <Button
            className="h-10"
            disabled={
              saving ||
              amountCents === null ||
              !changed ||
              stale ||
              !price.canEdit
            }
            type="submit"
          >
            {saving ? <Spinner /> : null}
            {saving ? "Updating price…" : "Update bundle price"}
          </Button>
        </div>
        <p
          className="max-w-xl text-sm leading-relaxed text-muted-foreground"
          id={`${inputId}-help`}
        >
          Applies to new checkouts. Existing purchases and checkouts already
          opened keep their original price.
        </p>
        {!price.canEdit ? (
          <p className="text-sm text-muted-foreground">
            Sign in as an admin to change pricing.
          </p>
        ) : null}
        {inputError || error || (stale && !saving) ? (
          <div
            className="flex flex-col items-start gap-2 text-sm text-destructive"
            id={`${inputId}-error`}
            role="alert"
          >
            <p>
              {stale
                ? "Another admin updated the price. Load the current price before editing."
                : (error ??
                  "Enter a price from $1 to $999,999.99, with at most two decimal places.")}
            </p>
            {stale ? (
              <Button
                onClick={() => {
                  setDraft(null);
                  setError(null);
                }}
                type="button"
                variant="outline"
              >
                Load current price
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </form>
  );
}
