import {
  IconBike,
  IconBolt,
  IconBrain,
  IconBrandSpeedtest,
  IconCalendar,
  IconCalendarWeek,
  IconGauge,
  IconHeart,
  IconKayak,
  IconLungs,
  IconMetronome,
  IconRoad,
  IconRocket,
  IconStopwatch,
  IconTags,
  IconWall,
  type TablerIcon,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  calculateSTL,
  formatMinutesToTime,
  formatWorkoutDate,
} from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";
import { TagBadge } from "./tag-badge";

type Workout = Doc<"workouts">;

interface WorkoutPropertyConfig {
  icon: TablerIcon;
  label: string;
  getValue: (workout: Workout) => string | ReactNode | null | number;
}

export const WORKOUT_PROPERTY_CONFIG: WorkoutPropertyConfig[] = [
  {
    getValue: (workout) => formatWorkoutDate(new Date(workout.workoutDate)),
    icon: IconCalendar,
    label: "Date",
  },
  {
    getValue: (workout) => workout.week,
    icon: IconCalendarWeek,
    label: "Week",
  },
  {
    getValue: (workout) => (
      <div className="flex flex-wrap items-center gap-2">
        {workout.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
    ),
    icon: IconTags,
    label: "Tags",
  },
  {
    getValue: (workout) => formatMinutesToTime(workout.trainingMinutes),
    icon: IconStopwatch,
    label: "Training mins",
  },
  {
    getValue: (workout) => (
      <div className="flex items-center gap-1">
        <span className="text-sm tabular-nums">{workout.rpe}</span>
        <CircularProgress size={24} strokeWidth={3} value={workout.rpe} />
      </div>
    ),
    icon: IconGauge,
    label: "RPE",
  },
  {
    getValue: (workout) =>
      calculateSTL(
        workout.rpe,
        workout.trainingMinutes,
        workout.totalRunMiles ?? null,
      ).toFixed(1),
    icon: IconBrain,
    label: "Subjective training load",
  },
  {
    getValue: (workout) => formatMinutesToTime(workout.cardioMinutes ?? null),
    icon: IconHeart,
    label: "Cardio mins",
  },
  {
    getValue: (workout) => workout.totalRunMiles,
    icon: IconRoad,
    label: "Run mi",
  },
  {
    getValue: (workout) => workout.lt2Miles,
    icon: IconBrandSpeedtest,
    label: "LT2 mi",
  },
  {
    getValue: (workout) => workout.lt1Miles,
    icon: IconMetronome,
    label: "LT1 mi",
  },
  {
    getValue: (workout) => workout.vo2Miles,
    icon: IconLungs,
    label: "VO2 mi",
  },
  {
    getValue: (workout) => workout.speedMiles,
    icon: IconRocket,
    label: "Speed mi",
  },
  {
    getValue: (workout) => workout.totalBikeMiles,
    icon: IconBike,
    label: "Bike mi",
  },
  {
    getValue: (workout) => workout.totalRowKs,
    icon: IconKayak,
    label: "Row km",
  },
  {
    getValue: (workout) => workout.burpees,
    icon: IconBolt,
    label: "Burpees",
  },
  {
    getValue: (workout) => workout.wallballs,
    icon: IconWall,
    label: "Wallballs",
  },
];
