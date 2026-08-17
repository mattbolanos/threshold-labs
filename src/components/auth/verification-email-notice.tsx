"use client";

import { IconLoader2, IconMailCheck } from "@tabler/icons-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { POST_AUTH_PATH } from "@/lib/auth/routes";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type DeliveryStatus = "error" | "idle" | "sent";

interface VerificationEmailNoticeProps {
  email: string;
  invalidLink: boolean;
}

export function VerificationEmailNotice({
  email,
  invalidLink,
}: VerificationEmailNoticeProps) {
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>("idle");
  const [isResending, startResendTransition] = useTransition();

  const resendVerificationEmail = () => {
    if (!email) return;

    setDeliveryStatus("idle");
    startResendTransition(async () => {
      try {
        const { error } = await authClient.sendVerificationEmail({
          callbackURL: POST_AUTH_PATH,
          email,
        });

        setDeliveryStatus(error ? "error" : "sent");
      } catch {
        setDeliveryStatus("error");
      }
    });
  };

  return (
    <div className="w-full rounded-xl border bg-card/85 p-7 shadow-xl shadow-foreground/5 backdrop-blur-sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/15">
          <IconMailCheck aria-hidden className="size-7 text-primary" />
        </div>

        <p className="text-sm text-muted-foreground">
          {email ? (
            <>
              A verification link was sent to{" "}
              <span className="font-medium text-foreground">{email}</span>. Open
              it to confirm your email and continue.
            </>
          ) : (
            "Open the verification link in your email to confirm your address and continue."
          )}
        </p>

        {invalidLink ? (
          <p
            className="mt-5 w-full rounded-lg bg-destructive/10 px-4 py-3 text-left text-sm text-destructive"
            role="alert"
          >
            That verification link is invalid or expired. Request a new link
            below, or sign in again if the email address is not shown.
          </p>
        ) : null}

        {deliveryStatus !== "idle" ? (
          <p
            aria-live="polite"
            className={cn(
              "mt-5 w-full rounded-lg px-4 py-3 text-left text-sm",
              deliveryStatus === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground",
            )}
            role={deliveryStatus === "error" ? "alert" : "status"}
          >
            {deliveryStatus === "error"
              ? "Unable to send a new verification email. Try again."
              : "A new verification email is on its way."}
          </p>
        ) : null}

        {email ? (
          <Button
            className="mt-6 w-full"
            disabled={isResending}
            onClick={resendVerificationEmail}
            size="lg"
            type="button"
            variant="outline"
          >
            {isResending ? (
              <>
                <IconLoader2 aria-hidden className="animate-spin" />
                <span>Sending…</span>
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>
        ) : null}

        <p className="mt-5 text-sm text-muted-foreground">
          Already verified?{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
            href="/login"
          >
            Return to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
