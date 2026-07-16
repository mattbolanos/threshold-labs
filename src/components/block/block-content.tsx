import { IconCalendarStats } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { WORKOUT_PROPERTY_CONFIG } from "@/components/workouts/workout-property-config";
import { formatDateRange } from "@/lib/race-dates";
import type { WorkoutWithTrainingBlock } from "@/lib/training-blocks";
import { cn } from "@/lib/utils";
import { FreeText } from "./free-text";
import { PropertyRow } from "./property-row";

interface BlockContentProps {
  workout: WorkoutWithTrainingBlock;
  className?: string;
}

export function BlockContent({ className, workout }: BlockContentProps) {
  const hasText = workout.workoutPlan || workout.notes;

  return (
    <div
      className={cn(
        "mb-4 space-y-1 overflow-y-auto px-2 md:-ms-1.5 md:px-0",
        className,
      )}
    >
      {WORKOUT_PROPERTY_CONFIG.map((property) => (
        <PropertyRow
          key={property.label}
          label={{ icon: property.icon, title: property.label }}
          suffix={property.suffix}
          value={property.getValue(workout)}
        />
      ))}
      <PropertyRow
        label={{ icon: IconCalendarStats, title: "Training block" }}
        value={
          workout.trainingBlock ? (
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-medium">{workout.trainingBlock.title}</span>
              <span className="text-xs text-muted-foreground">
                {formatDateRange(
                  workout.trainingBlock.startDate,
                  workout.trainingBlock.endDate,
                )}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">No training block</span>
          )
        }
      />
      {hasText && (
        <div className="space-y-2 px-2.5">
          <Separator />
          <div className="space-y-6">
            <FreeText text={workout.workoutPlan} title="Plan" />
            <FreeText text={workout.notes ?? ""} title="Notes" />
          </div>
        </div>
      )}
    </div>
  );
}
