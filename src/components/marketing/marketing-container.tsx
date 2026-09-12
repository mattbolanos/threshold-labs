import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function MarketingContainer({
  className,
  ...props
}: ComponentProps<"div">) {
  return <div className={cn("mx-auto max-w-7xl", className)} {...props} />;
}
