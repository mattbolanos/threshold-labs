import { DumbbellIcon } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface EmptyBlocksProps {
  className?: string;
}

export function EmptyBlocks({ className }: EmptyBlocksProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DumbbellIcon />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>No workouts this week, yet...</EmptyTitle>
    </Empty>
  );
}
