"use client";

import { useAction } from "convex/react";
import { type FormEvent, useId, useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { api } from "../../../convex/_generated/api";

export function AdminMemberTransition() {
  const issueOffer = useAction(api.discountCodes.generateDiscountCode);
  const [email, setEmail] = useState("");
  const [inviteAt, setInviteAt] = useState("2026-10-05T09:00");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  async function scheduleTransition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      await issueOffer({
        availableAt: new Date(inviteAt).getTime(),
        discountType: "fifty_monthly",
        recipientEmail: email,
      });
      setMessage(
        `Full access granted to ${email.trim()}. Their $50/month invitation is scheduled. You can review or revoke it in Issued codes below.`,
      );
      setEmail("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The transition could not be scheduled.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transition an existing member</CardTitle>
        <CardDescription>
          Give a member all historical and ongoing training data for free
          through their invitation date, then email a $50/month offer that keeps
          full history included. No card is required during the transition.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={scheduleTransition}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${id}-email`}>Member email</Label>
              <Input
                autoComplete="email"
                disabled={pending}
                id={`${id}-email`}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-date`}>
                Invitation date and time (your local time)
              </Label>
              <Input
                disabled={pending}
                id={`${id}-date`}
                onChange={(event) => setInviteAt(event.target.value)}
                required
                type="datetime-local"
                value={inviteAt}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Free access lasts through the invitation day in Eastern time. The
            member chooses when to subscribe; this does not cancel or change
            their existing payments.
          </p>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <output className="block text-sm">{message}</output>
          ) : null}
          <Button disabled={pending} type="submit">
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? "Scheduling…" : "Grant access & schedule invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
