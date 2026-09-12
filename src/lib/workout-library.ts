import { addDays, startOfWeek } from "date-fns";
import { formatQueryDate, parseQueryDate } from "@/lib/utils";
import type { Doc, Id } from "../../convex/_generated/dataModel";

export const WORKOUT_DATE_MODES = ["any", "week", "range"] as const;
export const WORKOUT_SORTS = ["newest", "oldest"] as const;

export type WorkoutDateMode = (typeof WORKOUT_DATE_MODES)[number];
export type WorkoutSort = (typeof WORKOUT_SORTS)[number];

export type WorkoutLibraryItem = Pick<
  Doc<"workouts">,
  "rpe" | "tags" | "title" | "trainingMinutes" | "week" | "workoutDate"
> & {
  _id: Id<"workouts">;
  trainingBlock: Pick<
    Doc<"trainingBlocks">,
    "_id" | "startDate" | "title"
  > | null;
};

export interface WorkoutLibraryFilters {
  block: string;
  dateMode: WorkoutDateMode;
  from: string;
  q: string;
  sort: WorkoutSort;
  tags: string[];
  to: string;
  week: string;
}

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

export function groupWorkoutsByMonth(workouts: WorkoutLibraryItem[]) {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      workouts: WorkoutLibraryItem[];
    }
  >();

  for (const workout of workouts) {
    const key = workout.workoutDate.slice(0, 7);
    const group = groups.get(key);
    if (group) {
      group.workouts.push(workout);
    } else {
      groups.set(key, {
        key,
        label: MONTH_FORMATTER.format(new Date(`${key}-01T00:00:00Z`)),
        workouts: [workout],
      });
    }
  }

  return Array.from(groups.values());
}

function getWeekBounds(value: string) {
  const selectedDate = parseQueryDate(value);
  if (!selectedDate) return null;

  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  return {
    from: formatQueryDate(start),
    to: formatQueryDate(addDays(start, 6)),
  };
}

function matchesSearch(workout: WorkoutLibraryItem, query: string) {
  if (!query) return true;

  return [
    workout.title,
    workout.workoutDate,
    workout.week,
    workout.trainingBlock?.title ?? "",
    ...workout.tags,
  ].some((value) => value.toLocaleLowerCase().includes(query));
}

export function filterAndSortWorkouts(
  workouts: WorkoutLibraryItem[],
  filters: WorkoutLibraryFilters,
) {
  const query = filters.q.trim().toLocaleLowerCase();
  const selectedTags = new Set(filters.tags);
  const weekBounds =
    filters.dateMode === "week" ? getWeekBounds(filters.week) : null;
  const rangeFrom =
    filters.dateMode === "range" && parseQueryDate(filters.from)
      ? filters.from
      : null;
  const rangeTo =
    filters.dateMode === "range" && parseQueryDate(filters.to)
      ? filters.to
      : null;

  return workouts
    .filter((workout) => {
      if (!matchesSearch(workout, query)) return false;
      if (
        selectedTags.size > 0 &&
        !workout.tags.some((tag) => selectedTags.has(tag))
      ) {
        return false;
      }
      if (
        filters.block !== "all" &&
        (filters.block === "none"
          ? workout.trainingBlock !== null
          : workout.trainingBlock?._id !== filters.block)
      ) {
        return false;
      }
      if (
        weekBounds &&
        (workout.workoutDate < weekBounds.from ||
          workout.workoutDate > weekBounds.to)
      ) {
        return false;
      }
      if (rangeFrom && workout.workoutDate < rangeFrom) return false;
      if (rangeTo && workout.workoutDate > rangeTo) return false;
      return true;
    })
    .toSorted((a, b) => {
      const dateComparison = a.workoutDate.localeCompare(b.workoutDate);
      if (dateComparison !== 0) {
        return filters.sort === "oldest" ? dateComparison : -dateComparison;
      }
      return a.title.localeCompare(b.title);
    });
}

export function getWorkoutWeekStart(workoutDate: string) {
  const date = parseQueryDate(workoutDate);
  if (!date) return workoutDate;
  return formatQueryDate(startOfWeek(date, { weekStartsOn: 1 }));
}

export function hasActiveWorkoutFilters(filters: WorkoutLibraryFilters) {
  return (
    filters.q.trim().length > 0 ||
    filters.tags.length > 0 ||
    filters.block !== "all" ||
    filters.dateMode !== "any"
  );
}
