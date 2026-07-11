import type { ReactNode } from "react";
import { type Definition, InfoPopover } from "@/components/chart/info-popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  children: ReactNode;
  className?: string;
  definitions: Definition[];
  description: string;
  infoTitle?: string;
  title: string;
}

export function ChartCard({
  children,
  className,
  definitions,
  description,
  title,
  infoTitle = title,
}: ChartCardProps) {
  return (
    <Card className={cn("min-h-54 w-full gap-0 rounded-xl py-0", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pt-4 pb-0">
        <div className="min-w-0">
          <CardTitle className="text-base font-bold">{title}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        </div>
        <InfoPopover definitions={definitions} title={infoTitle} />
      </CardHeader>
      <CardContent className="px-5 pb-3">{children}</CardContent>
    </Card>
  );
}
