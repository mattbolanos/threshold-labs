import { IconEye, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateLabel, type Workout } from "./workout-form-utils";

type WorkoutDetailsPanelProps = {
  onClose: () => void;
  workout: Workout | null;
};

const metricRows: Array<{ key: keyof Workout; label: string; unit?: string }> =
  [
    { key: "trainingMinutes", label: "Training", unit: "min" },
    { key: "rpe", label: "RPE" },
    { key: "cardioMinutes", label: "Cardio", unit: "min" },
    { key: "totalRunMiles", label: "Run", unit: "mi" },
    { key: "lt1Miles", label: "LT1", unit: "mi" },
    { key: "lt2Miles", label: "LT2", unit: "mi" },
    { key: "vo2Miles", label: "VO2", unit: "mi" },
    { key: "speedMiles", label: "Speed", unit: "mi" },
    { key: "totalBikeMiles", label: "Bike", unit: "mi" },
    { key: "totalSkiKs", label: "Ski", unit: "k" },
    { key: "totalRowKs", label: "Row", unit: "k" },
    { key: "burpees", label: "Burpees" },
    { key: "wallballs", label: "Wallballs" },
  ];

export function WorkoutDetailsPanel({
  onClose,
  workout,
}: WorkoutDetailsPanelProps) {
  if (!workout) {
    return (
      <Card className="px-1 sm:px-2">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Workout Details
          </CardTitle>
          <CardDescription>
            Select a logged workout to view full details.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="px-1 sm:px-2">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg">
              Workout Details
            </CardTitle>
            <CardDescription>{workout.title}</CardDescription>
            <p className="text-muted-foreground text-xs">
              {formatDateLabel(workout.workoutDate)} • {workout.week} •{" "}
              {workout.isHidden ? "Hidden" : "Visible"}
            </p>
          </div>
          <Button
            className="min-h-11"
            onClick={onClose}
            type="button"
            variant="outline"
          >
            <IconX aria-hidden />
            <span>Close</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {metricRows.map((metric) => {
            const rawValue = workout[metric.key];
            if (rawValue === undefined || rawValue === null) {
              return null;
            }

            return (
              <div
                className="bg-muted/30 rounded-lg border px-3 py-2"
                key={metric.key}
              >
                <p className="text-muted-foreground text-xs">{metric.label}</p>
                <p className="text-sm font-medium tabular-nums">
                  {rawValue}
                  {metric.unit ? ` ${metric.unit}` : ""}
                </p>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Tags</p>
          <p className="text-muted-foreground text-sm">
            {workout.tags.join(", ")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="space-y-2">
            <h4 className="text-sm font-semibold">Plan</h4>
            <p className="text-muted-foreground rounded-lg border px-3 py-2 text-sm whitespace-pre-wrap">
              {workout.workoutPlan || "No plan provided."}
            </p>
          </section>
          <section className="space-y-2">
            <h4 className="text-sm font-semibold">Notes</h4>
            <p className="text-muted-foreground rounded-lg border px-3 py-2 text-sm whitespace-pre-wrap">
              {workout.notes || "No notes provided."}
            </p>
          </section>
        </div>

        <p className="text-muted-foreground flex items-center gap-2 text-xs">
          <IconEye aria-hidden className="size-4" />
          Viewing this workout does not change edit state.
        </p>
      </CardContent>
    </Card>
  );
}
