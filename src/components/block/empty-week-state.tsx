import { IconBarbell } from "@tabler/icons-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface EmptyWeekStateProps {
  className?: string;
}

export function EmptyWeekState({ className }: EmptyWeekStateProps) {
  return (
    <Empty
      className={cn("bg-muted/30 mx-auto border border-dashed", className)}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconBarbell />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>Rest week — no workouts scheduled</EmptyTitle>
    </Empty>
  );
}
