import { describe, expect, test } from "bun:test";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import {
  filterAndSortWorkouts,
  type WorkoutLibraryFilters,
  type WorkoutLibraryItem,
} from "./workout-library";

const baseFilters: WorkoutLibraryFilters = {
  block: "all",
  dateMode: "any",
  from: "",
  q: "",
  sort: "newest",
  tags: [],
  to: "",
  week: "",
};

const block = {
  _creationTime: 1,
  _id: "block-1" as Id<"trainingBlocks">,
  createdAt: 1,
  description: "Build toward spring racing.",
  endDate: "2026-04-30",
  startDate: "2026-03-01",
  title: "Spring build",
  updatedAt: 1,
} satisfies Doc<"trainingBlocks">;

const workouts: WorkoutLibraryItem[] = [
  {
    _id: "workout-1" as Id<"workouts">,
    rpe: 4,
    tags: ["Aerobic Run"],
    title: "Easy river loop",
    trainingBlock: block,
    trainingMinutes: 50,
    week: "2026-03-02",
    workoutDate: "2026-03-04",
  },
  {
    _id: "workout-2" as Id<"workouts">,
    rpe: 8,
    tags: ["Quality Running", "Strength"],
    title: "Hill repetitions",
    trainingBlock: null,
    trainingMinutes: 75,
    week: "2026-02-23",
    workoutDate: "2026-02-27",
  },
];

describe("filterAndSortWorkouts", () => {
  test("searches title, tag, and training block", () => {
    expect(
      filterAndSortWorkouts(workouts, { ...baseFilters, q: "spring" }),
    ).toEqual([workouts[0]]);
    expect(
      filterAndSortWorkouts(workouts, { ...baseFilters, q: "strength" }),
    ).toEqual([workouts[1]]);
  });

  test("combines independent tag and block filters", () => {
    expect(
      filterAndSortWorkouts(workouts, {
        ...baseFilters,
        block: block._id,
        tags: ["Aerobic Run"],
      }),
    ).toEqual([workouts[0]]);
  });

  test("filters by the week containing a selected date", () => {
    expect(
      filterAndSortWorkouts(workouts, {
        ...baseFilters,
        dateMode: "week",
        week: "2026-03-06",
      }),
    ).toEqual([workouts[0]]);
  });

  test("filters an inclusive date range", () => {
    expect(
      filterAndSortWorkouts(workouts, {
        ...baseFilters,
        dateMode: "range",
        from: "2026-02-27",
        to: "2026-03-03",
      }),
    ).toEqual([workouts[1]]);
  });

  test("sorts oldest first when requested", () => {
    expect(
      filterAndSortWorkouts(workouts, {
        ...baseFilters,
        sort: "oldest",
      }).map((workout) => workout._id),
    ).toEqual([workouts[1]._id, workouts[0]._id]);
  });
});
