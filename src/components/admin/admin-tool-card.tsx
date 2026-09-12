import type { TablerIcon } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminToolCardProps {
  actionLabel: string;
  description: string;
  href: Route;
  icon: TablerIcon;
  title: string;
  wide?: boolean;
}

export function AdminToolCard({
  actionLabel,
  description,
  href,
  icon: Icon,
  title,
  wide = false,
}: AdminToolCardProps) {
  return (
    <Card
      className={cn(
        "h-full gap-0 py-0 shadow-sm transition-shadow hover:shadow-md",
        wide && "md:flex-row md:items-center md:justify-between",
      )}
    >
      <CardHeader
        className={cn("flex-1 px-4 pt-4 md:px-5 md:pt-5", wide && "md:py-5")}
      >
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Icon aria-hidden className="size-5" stroke={2} />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="font-semibold tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="leading-relaxed">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "mt-auto px-4 pt-4 pb-4 md:px-5 md:pt-4 md:pb-5",
          wide && "md:mt-0 md:shrink-0 md:py-5 md:ps-0",
        )}
      >
        <Link
          className={buttonVariants({
            className: "min-h-11 w-full sm:w-auto",
            variant: wide ? "default" : "outline",
          })}
          href={href}
        >
          {actionLabel}
        </Link>
      </CardContent>
    </Card>
  );
}
