import type { LucideIcon } from "lucide-react";
import {
  BikeIcon,
  BrickWallIcon,
  Calendar1Icon,
  CupSodaIcon,
  FlameIcon,
  FootprintsIcon,
  GaugeIcon,
  HeartIcon,
  KayakIcon,
  RabbitIcon,
  RefreshCcwIcon,
  RocketIcon,
  TagIcon,
  TimerIcon,
  WeightIcon,
  WindIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { formatMinutesToTime } from "@/lib/utils";
import type { WorkoutsOutput } from "@/server/api/types";
import { TagBadge } from "./tag-badge";

type Workout = WorkoutsOutput[number];

interface WorkoutPropertyConfig {
  Icon: LucideIcon;
  label: string;
  getValue: (workout: Workout) => string | ReactNode | null | number;
}

export const WORKOUT_PROPERTY_CONFIG: WorkoutPropertyConfig[] = [
  {
    getValue: (workout) =>
      new Date(workout.workoutDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
        year: "numeric",
      }),
    Icon: Calendar1Icon,
    label: "Date",
  },
  {
    getValue: (workout) => workout.week,
    Icon: RefreshCcwIcon,
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
    Icon: TagIcon,
    label: "Tags",
  },
  {
    getValue: (workout) => formatMinutesToTime(workout.trainingMinutes),
    Icon: TimerIcon,
    label: "Training mins",
  },
  {
    getValue: (workout) => (
      <div className="flex items-center gap-1">
        <span className="text-sm tabular-nums">{workout.rpe}</span>
        <CircularProgress size={24} strokeWidth={3} value={workout.rpe} />
      </div>
    ),
    Icon: FlameIcon,
    label: "RPE",
  },
  {
    getValue: (workout) => workout.subjectiveTrainingLoad,
    Icon: WeightIcon,
    label: "Subjective training load",
  },
  {
    getValue: (workout) => formatMinutesToTime(workout.cardioMinutes),
    Icon: HeartIcon,
    label: "Cardio mins",
  },
  {
    getValue: (workout) => workout.totalRunMiles,
    Icon: FootprintsIcon,
    label: "Run mi",
  },
  {
    getValue: (workout) => workout.thresholdMiles,
    Icon: GaugeIcon,
    label: "Threshold mi",
  },
  {
    getValue: (workout) => workout.tempoMiles,
    Icon: RabbitIcon,
    label: "Tempo mi",
  },
  {
    getValue: (workout) => workout.vo2Miles,
    Icon: WindIcon,
    label: "VO2 mi",
  },
  {
    getValue: (workout) => workout.speedMiles,
    Icon: RocketIcon,
    label: "Speed mi",
  },
  {
    getValue: (workout) => workout.totalBikeMiles,
    Icon: BikeIcon,
    label: "Bike mi",
  },
  {
    getValue: (workout) => workout.totalRowKs,
    Icon: KayakIcon,
    label: "Row km",
  },
  {
    getValue: (workout) => workout.burpees,
    Icon: CupSodaIcon,
    label: "Burpees",
  },
  {
    getValue: (workout) => workout.wallballs,
    Icon: BrickWallIcon,
    label: "Wallballs",
  },
];
