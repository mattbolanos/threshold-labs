import { IconArrowRight, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatTrainingAccessRange,
  formatTrainingBlockSpan,
  formatWorkoutCount,
  type TrainingBlockCatalogEntry,
  trainingBlockPass,
} from "@/lib/billing";
import { cn } from "@/lib/utils";

interface TrainingBlockCatalogProps {
  blocks: TrainingBlockCatalogEntry[];
  disabled: boolean;
  onCheckout: (trainingBlockId: string) => void;
  openingBlockId: string | null;
}

export function TrainingBlockCatalog({
  blocks,
  disabled,
  onCheckout,
  openingBlockId,
}: TrainingBlockCatalogProps) {
  if (blocks.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="training-block-catalog-heading">
      <div className="max-w-2xl">
        <h2
          className="text-xl font-semibold tracking-tight"
          id="training-block-catalog-heading"
        >
          Individual blocks
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          Pick the blocks you want for {trainingBlockPass.priceLabel}. Each
          purchase unlocks every workout in that block and every Lab Note for
          good, with no membership required. An in-progress block includes the
          workouts published so far, and the rest of the block as it lands.
        </p>
      </div>

      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map((block) => (
          <li className="flex" key={block._id}>
            <TrainingBlockCard
              block={block}
              disabled={disabled}
              isOpening={openingBlockId === block._id}
              onCheckout={() => onCheckout(block._id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

interface TrainingBlockCardProps {
  block: TrainingBlockCatalogEntry;
  disabled: boolean;
  isOpening: boolean;
  onCheckout: () => void;
}

function TrainingBlockCard({
  block,
  disabled,
  isOpening,
  onCheckout,
}: TrainingBlockCardProps) {
  const dateRange = formatTrainingAccessRange(block.startDate, block.endDate);

  return (
    <Card
      aria-disabled={block.isOwned}
      className={cn(
        "h-full w-full bg-card/80 shadow-sm shadow-black/20",
        block.isOwned && "bg-card/40 shadow-none ring-foreground/6",
      )}
      data-owned={block.isOwned ? "" : undefined}
    >
      <CardHeader className="gap-0 group-data-[owned]/card:opacity-60">
        <CardTitle className="flex items-center justify-between">
          <h3 className="text-lg leading-tight font-semibold tracking-tight text-balance">
            {block.title}
          </h3>
          {block.isOwned ? (
            <Badge variant="outline">
              <IconCheck aria-hidden data-icon="inline-start" stroke={2.5} />
              Purchased
            </Badge>
          ) : block.isCompleted ? null : (
            <Badge variant="accent">In progress</Badge>
          )}
        </CardTitle>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex flex-wrap gap-x-2">
            <dt className="sr-only">Dates</dt>
            <dd className="tabular-nums">{dateRange}</dd>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
            <dt className="sr-only">Length</dt>
            <dd className="tabular-nums">
              {formatTrainingBlockSpan(block.startDate, block.endDate)}
            </dd>
            <span aria-hidden>·</span>
            <dt className="sr-only">Workouts</dt>
            <dd className="tabular-nums">
              {formatWorkoutCount(block.workoutCount)}
              {block.isCompleted ? "" : " so far"}
            </dd>
          </div>
        </dl>
      </CardHeader>
      <CardContent className="flex-1 group-data-[owned]/card:opacity-60">
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
          {block.description}
        </p>
      </CardContent>
      <CardFooter className="mt-auto border-t-0 bg-transparent pt-0">
        {block.isOwned ? (
          <p className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-muted/40 text-sm font-medium text-muted-foreground">
            <IconCheck aria-hidden className="size-4" stroke={2} />
            <span>Already purchased</span>
          </p>
        ) : (
          <Button
            className="min-h-11 w-full motion-safe:transition-transform motion-safe:active:scale-96"
            disabled={disabled || isOpening}
            onClick={onCheckout}
            size="lg"
            type="button"
            variant={disabled && !isOpening ? "outline" : "default"}
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
                <span>Buy block for ${trainingBlockPass.price}</span>
                <IconArrowRight aria-hidden data-icon="inline-end" stroke={2} />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
