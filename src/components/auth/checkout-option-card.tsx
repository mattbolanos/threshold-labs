import {
  IconArrowRight,
  IconCheck,
  IconLoader2,
  IconMinus,
} from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CheckoutOptionCardProps {
  badge?: string;
  buttonLabel: string;
  description: string;
  disabled?: boolean;
  features: string[];
  icon: ReactNode;
  isOpening: boolean;
  isOwned?: boolean;
  limitations?: string[];
  onCheckout: () => void;
  ownedHref?: Route;
  ownedLabel?: string;
  priceLabel: string;
  title: string;
  variant?: "default" | "outline";
}

export function CheckoutOptionCard({
  badge,
  buttonLabel,
  description,
  disabled = false,
  features,
  icon,
  isOpening,
  isOwned = false,
  limitations = [],
  onCheckout,
  ownedHref,
  ownedLabel,
  priceLabel,
  title,
  variant = "default",
}: CheckoutOptionCardProps) {
  return (
    <Card
      className={cn(
        "h-full bg-card/80 shadow-sm shadow-black/20",
        variant === "default" && "ring-primary/35 shadow-primary/10",
      )}
    >
      <CardHeader className="gap-0">
        <div className="mb-6 flex items-start justify-between gap-3">
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary/12 text-primary">
            {icon}
          </span>
          {badge ? <Badge variant="secondary">{badge}</Badge> : null}
        </div>
        <CardTitle>
          <h2 className="text-balance text-2xl leading-tight font-semibold tracking-tight">
            {title}
          </h2>
        </CardTitle>
        <p className="mt-3 text-3xl leading-none font-bold tracking-tight tabular-nums">
          {priceLabel}
        </p>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        <ul className="space-y-3 text-sm">
          {features.map((feature) => (
            <li className="flex items-start gap-3 text-pretty" key={feature}>
              <IconCheck
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-primary"
                stroke={2}
              />
              <span>{feature}</span>
            </li>
          ))}
          {limitations.map((limitation) => (
            <li
              className="flex items-start gap-3 text-pretty text-muted-foreground"
              key={limitation}
            >
              <IconMinus
                aria-hidden
                className="mt-0.5 size-4 shrink-0"
                stroke={2}
              />
              <span>{limitation}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto border-t-0 bg-transparent pt-0">
        {isOwned && ownedHref && ownedLabel && !disabled ? (
          <Link
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "min-h-11 w-full motion-safe:transition-transform motion-safe:active:scale-96",
            )}
            href={ownedHref}
          >
            <span>{ownedLabel}</span>
            <IconArrowRight aria-hidden data-icon="inline-end" stroke={2} />
          </Link>
        ) : (
          <Button
            className="min-h-11 w-full motion-safe:transition-transform motion-safe:active:scale-96"
            disabled={disabled || isOpening || isOwned}
            onClick={onCheckout}
            size="lg"
            type="button"
            variant={disabled && !isOpening ? "outline" : variant}
          >
            {isOpening ? (
              <>
                <IconLoader2
                  aria-hidden
                  className="motion-safe:animate-spin"
                  data-icon="inline-start"
                />
                <span aria-live="polite">Opening Stripe…</span>
              </>
            ) : (
              <>
                <span>{buttonLabel}</span>
                {disabled ? null : isOwned ? (
                  <IconCheck aria-hidden data-icon="inline-end" stroke={2} />
                ) : (
                  <IconArrowRight
                    aria-hidden
                    data-icon="inline-end"
                    stroke={2}
                  />
                )}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
