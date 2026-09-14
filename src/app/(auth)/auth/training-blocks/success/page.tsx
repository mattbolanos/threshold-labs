import { IconAlertCircle } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthHeader } from "@/components/auth/auth-header";
import { buttonVariants } from "@/components/ui/button";
import { confirmTrainingBlockCheckout } from "@/lib/auth/training-block-actions";

export const metadata: Metadata = {
  title: "Confirming Block Access | Threshold Lab",
};

export default async function TrainingBlockSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const { session_id: rawSessionId } = await searchParams;
  const sessionId = Array.isArray(rawSessionId)
    ? rawSessionId[0]
    : rawSessionId;
  const confirmed = sessionId
    ? await confirmTrainingBlockCheckout(sessionId).catch(() => false)
    : false;

  if (confirmed) {
    redirect("/lab/training/workouts");
  }

  return (
    <div className="relative z-10 w-full max-w-md px-4 sm:px-0">
      <AuthHeader
        description="Your payment may still be processing. No additional payment is needed."
        title="We couldn’t confirm access yet"
      />
      <div className="rounded-xl border bg-card/85 p-7 text-center shadow-xl shadow-foreground/5 backdrop-blur-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <IconAlertCircle aria-hidden className="size-6" />
        </span>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Return to your account in a moment. If training access does not
          appear, contact your coach with your Stripe receipt.
        </p>
        <Link
          className={buttonVariants({ className: "mt-6 w-full", size: "lg" })}
          href="/account/billing"
        >
          View account
        </Link>
      </div>
    </div>
  );
}
