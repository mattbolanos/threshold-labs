import type { Doc } from "../../../convex/_generated/dataModel";

export type Workout = Doc<"workouts">;

export type WorkoutFormState = {
  burpees: string;
  cardioMinutes: string;
  isHidden: boolean;
  lt1Miles: string;
  lt2Miles: string;
  notes: string;
  rpe: string;
  speedMiles: string;
  tags: string[];
  title: string;
  totalBikeMiles: string;
  totalRowKs: string;
  totalRunMiles: string;
  totalSkiKs: string;
  trainingMinutes: string;
  vo2Miles: string;
  wallballs: string;
  week: string;
  workoutDate: string;
  workoutPlan: string;
};

export const FILTER_VALUES = {
  all: "all",
  hidden: "hidden",
  visible: "visible",
} as const;

export type FilterValue = (typeof FILTER_VALUES)[keyof typeof FILTER_VALUES];

export const FILTER_OPTIONS: Array<{ label: string; value: FilterValue }> = [
  { label: "All", value: FILTER_VALUES.all },
  { label: "Visible", value: FILTER_VALUES.visible },
  { label: "Hidden", value: FILTER_VALUES.hidden },
];

export const METRIC_FIELD_CONFIG = [
  {
    id: "trainingMinutes",
    isRequired: true,
    label: "Training Minutes",
    placeholder: "e.g., 75…",
  },
  { id: "rpe", isRequired: true, label: "RPE", placeholder: "e.g., 7…" },
  {
    id: "cardioMinutes",
    isRequired: false,
    label: "Cardio Minutes",
    placeholder: "e.g., 30…",
  },
  {
    id: "totalRunMiles",
    isRequired: false,
    label: "Run Miles",
    placeholder: "e.g., 9.5…",
  },
  {
    id: "lt1Miles",
    isRequired: false,
    label: "LT1 Miles",
    placeholder: "e.g., 4…",
  },
  {
    id: "lt2Miles",
    isRequired: false,
    label: "LT2 Miles",
    placeholder: "e.g., 2…",
  },
  {
    id: "vo2Miles",
    isRequired: false,
    label: "VO2 Miles",
    placeholder: "e.g., 1…",
  },
  {
    id: "speedMiles",
    isRequired: false,
    label: "Speed Miles",
    placeholder: "e.g., 0.8…",
  },
  {
    id: "totalBikeMiles",
    isRequired: false,
    label: "Bike Miles",
    placeholder: "e.g., 20…",
  },
  {
    id: "totalSkiKs",
    isRequired: false,
    label: "Ski K",
    placeholder: "e.g., 4…",
  },
  {
    id: "totalRowKs",
    isRequired: false,
    label: "Row K",
    placeholder: "e.g., 3…",
  },
  {
    id: "burpees",
    isRequired: false,
    label: "Burpees",
    placeholder: "e.g., 40…",
  },
  {
    id: "wallballs",
    isRequired: false,
    label: "Wallballs",
    placeholder: "e.g., 50…",
  },
] as const;

export const EMPTY_WORKOUT_FORM: WorkoutFormState = {
  burpees: "",
  cardioMinutes: "",
  isHidden: false,
  lt1Miles: "",
  lt2Miles: "",
  notes: "",
  rpe: "",
  speedMiles: "",
  tags: [],
  title: "",
  totalBikeMiles: "",
  totalRowKs: "",
  totalRunMiles: "",
  totalSkiKs: "",
  trainingMinutes: "",
  vo2Miles: "",
  wallballs: "",
  week: "",
  workoutDate: "",
  workoutPlan: "",
};

export function toWorkoutFormState(workout: Workout): WorkoutFormState {
  return {
    burpees: workout.burpees?.toString() ?? "",
    cardioMinutes: workout.cardioMinutes?.toString() ?? "",
    isHidden: workout.isHidden === true,
    lt1Miles: workout.lt1Miles?.toString() ?? "",
    lt2Miles: workout.lt2Miles?.toString() ?? "",
    notes: workout.notes ?? "",
    rpe: workout.rpe?.toString() ?? "",
    speedMiles: workout.speedMiles?.toString() ?? "",
    tags: Array.isArray(workout.tags) ? workout.tags : [],
    title: workout.title ?? "",
    totalBikeMiles: workout.totalBikeMiles?.toString() ?? "",
    totalRowKs: workout.totalRowKs?.toString() ?? "",
    totalRunMiles: workout.totalRunMiles?.toString() ?? "",
    totalSkiKs: workout.totalSkiKs?.toString() ?? "",
    trainingMinutes: workout.trainingMinutes?.toString() ?? "",
    vo2Miles: workout.vo2Miles?.toString() ?? "",
    wallballs: workout.wallballs?.toString() ?? "",
    week: workout.week ?? "",
    workoutDate: workout.workoutDate ?? "",
    workoutPlan: workout.workoutPlan ?? "",
  };
}

function parseRequiredNumber(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      error: `${label} is required.`,
      value: null,
    };
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return {
      error: `${label} must be a valid number.`,
      value: null,
    };
  }

  return { error: null, value: parsed };
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return {
      error: null,
      value: null,
    };
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return {
      error: "Must be a valid number.",
      value: null,
    };
  }

  return { error: null, value: parsed };
}

export function validateWorkoutForm(form: WorkoutFormState) {
  const errors: string[] = [];

  const title = (form.title ?? "").trim();
  if (!title) {
    errors.push("Title is required.");
  }

  const workoutDate = (form.workoutDate ?? "").trim();
  if (!workoutDate) {
    errors.push("Workout date is required.");
  }

  const week = (form.week ?? "").trim();
  if (!week) {
    errors.push("Week is required.");
  }

  const workoutPlan = (form.workoutPlan ?? "").trim();
  if (!workoutPlan) {
    errors.push("Workout plan is required.");
  }

  const tags = form.tags ?? [];
  if (tags.length === 0) {
    errors.push("At least one tag is required.");
  }

  const trainingMinutesResult = parseRequiredNumber(
    form.trainingMinutes ?? "",
    "Training minutes",
  );
  if (trainingMinutesResult.error) {
    errors.push(trainingMinutesResult.error);
  }

  const rpeResult = parseRequiredNumber(form.rpe ?? "", "RPE");
  if (rpeResult.error) {
    errors.push(rpeResult.error);
  }

  const optionalFieldEntries = METRIC_FIELD_CONFIG.filter(
    (field) => !field.isRequired,
  );

  for (const field of optionalFieldEntries) {
    const parseResult = parseOptionalNumber(form[field.id]);
    if (parseResult.error) {
      errors.push(`${field.label}: ${parseResult.error}`);
    }
  }

  if (
    errors.length > 0 ||
    trainingMinutesResult.value === null ||
    rpeResult.value === null
  ) {
    return { errors, workout: null };
  }

  return {
    errors,
    workout: {
      burpees: parseOptionalNumber(form.burpees).value,
      cardioMinutes: parseOptionalNumber(form.cardioMinutes).value,
      isHidden: form.isHidden,
      lt1Miles: parseOptionalNumber(form.lt1Miles).value,
      lt2Miles: parseOptionalNumber(form.lt2Miles).value,
      notes: (form.notes ?? "").trim() || null,
      rpe: rpeResult.value,
      speedMiles: parseOptionalNumber(form.speedMiles).value,
      tags,
      title,
      totalBikeMiles: parseOptionalNumber(form.totalBikeMiles).value,
      totalRowKs: parseOptionalNumber(form.totalRowKs).value,
      totalRunMiles: parseOptionalNumber(form.totalRunMiles).value,
      totalSkiKs: parseOptionalNumber(form.totalSkiKs).value,
      trainingMinutes: trainingMinutesResult.value,
      vo2Miles: parseOptionalNumber(form.vo2Miles).value,
      wallballs: parseOptionalNumber(form.wallballs).value,
      week,
      workoutDate,
      workoutPlan,
    },
  };
}

export function formatDateLabel(workoutDate: string) {
  const parsedDate = new Date(`${workoutDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return workoutDate;
  }

  return parsedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isValidFilterValue(value: string | null): value is FilterValue {
  return value === "all" || value === "visible" || value === "hidden";
}

export const METRIC_ROWS: Array<{
  key: keyof Workout;
  label: string;
  unit?: string;
}> = [
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
