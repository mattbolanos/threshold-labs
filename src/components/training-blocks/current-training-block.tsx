import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateRange } from "@/lib/race-dates";
import type { Doc } from "../../../convex/_generated/dataModel";

export function CurrentTrainingBlockSkeleton() {
  return <Skeleton className="h-44 w-full rounded-xl" />;
}

type CurrentTrainingBlockProps = {
  block: Doc<"trainingBlocks"> | null;
};

export function CurrentTrainingBlock({ block }: CurrentTrainingBlockProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Current block focus
        </CardTitle>

        <CardDescription>
          {block ? (
            formatDateRange(block.startDate, block.endDate)
          ) : (
            <p>No block selected.</p>
          )}
        </CardDescription>
      </CardHeader>
      {block ? (
        <CardContent>
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold tracking-tight">{block.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {block.description}
            </p>
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
