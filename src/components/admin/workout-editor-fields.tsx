import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  METRIC_FIELD_CONFIG,
  type WorkoutFormState,
} from "./workout-form-utils";

type WorkoutEditorFieldsProps = {
  form: WorkoutFormState;
  idPrefix: string;
  onChange: <K extends keyof WorkoutFormState>(
    field: K,
    value: WorkoutFormState[K],
  ) => void;
};

export function WorkoutEditorFields({
  form,
  idPrefix,
  onChange,
}: WorkoutEditorFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-title`}>Title</Label>
          <Input
            autoComplete="off"
            className="min-h-11"
            id={`${idPrefix}-title`}
            name={`${idPrefix}-title`}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder="e.g., Long Run + Tempo…"
            required
            value={form.title}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-workoutDate`}>Workout Date</Label>
          <Input
            className="min-h-11"
            id={`${idPrefix}-workoutDate`}
            name={`${idPrefix}-workoutDate`}
            onChange={(event) => onChange("workoutDate", event.target.value)}
            required
            type="date"
            value={form.workoutDate}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-week`}>Week</Label>
          <Input
            autoComplete="off"
            className="min-h-11"
            id={`${idPrefix}-week`}
            name={`${idPrefix}-week`}
            onChange={(event) => onChange("week", event.target.value)}
            placeholder="e.g., 2026-W07…"
            required
            value={form.week}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-tags`}>Tags</Label>
          <Input
            autoComplete="off"
            className="min-h-11"
            id={`${idPrefix}-tags`}
            name={`${idPrefix}-tags`}
            onChange={(event) => onChange("tags", event.target.value)}
            placeholder="Aerobic Run, Strength…"
            required
            value={form.tags}
          />
          <p className="text-muted-foreground text-xs">
            Separate tags with commas.
          </p>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-workoutPlan`}>Workout Plan</Label>
          <textarea
            className="border-input bg-background min-h-24 w-full rounded-lg border px-4 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            id={`${idPrefix}-workoutPlan`}
            name={`${idPrefix}-workoutPlan`}
            onChange={(event) => onChange("workoutPlan", event.target.value)}
            placeholder="Describe the workout plan…"
            required
            value={form.workoutPlan}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${idPrefix}-notes`}>Notes</Label>
          <textarea
            className="border-input bg-background min-h-20 w-full rounded-lg border px-4 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            id={`${idPrefix}-notes`}
            name={`${idPrefix}-notes`}
            onChange={(event) => onChange("notes", event.target.value)}
            placeholder="Optional notes…"
            value={form.notes}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Metrics</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {METRIC_FIELD_CONFIG.map((field) => (
            <div className="space-y-1.5" key={`${idPrefix}-${field.id}`}>
              <Label htmlFor={`${idPrefix}-${field.id}`}>
                {field.label}
                {field.isRequired ? " *" : ""}
              </Label>
              <Input
                autoComplete="off"
                className="min-h-11"
                id={`${idPrefix}-${field.id}`}
                inputMode="decimal"
                name={`${idPrefix}-${field.id}`}
                onChange={(event) => onChange(field.id, event.target.value)}
                placeholder={field.placeholder}
                required={field.isRequired === true}
                type="text"
                value={form[field.id]}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
