import { DumbbellIcon } from "lucide-react";
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
      className={cn("bg-accent/40 mx-auto border-2 border-dashed", className)}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DumbbellIcon />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>No workouts this week, yet...</EmptyTitle>
    </Empty>
  );
}
