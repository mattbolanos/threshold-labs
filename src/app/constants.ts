import {
  type AvailableChartColorsKeys,
  getColorClassName,
} from "@/lib/chart-utils";

export type RunMixCategory =
  "aerobicMiles" | "speedMiles" | "lt1Miles" | "lt2Miles" | "vo2Miles";

export type SessionIntensityCategory =
  "easySessions" | "moderateSessions" | "hardSessions" | "veryHardSessions";

export const SESSION_INTENSITY_CATEGORY_LABELS: Record<
  SessionIntensityCategory,
  string
> = {
  easySessions: "Easy",
  hardSessions: "Hard",
  moderateSessions: "Moderate",
  veryHardSessions: "Very hard",
};

export const SESSION_INTENSITY_COLORS: AvailableChartColorsKeys[] = [
  "chart-1",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
];

export const RUN_MIX_COLORS: AvailableChartColorsKeys[] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "chart-6",
];

export const RUN_MIX_CATEGORY_LABELS: Record<RunMixCategory, string> = {
  aerobicMiles: "Aerobic Miles",
  lt1Miles: "LT1 Miles",
  lt2Miles: "LT2 Miles",
  speedMiles: "Speed Miles",
  vo2Miles: "VO2 Miles",
};

export const SESSION_INTENSITY_DEFINITIONS = [
  {
    colorClassName: getColorClassName(SESSION_INTENSITY_COLORS[0], "bg"),
    description: "Sessions with an RPE from 1 to 3.",
    label: SESSION_INTENSITY_CATEGORY_LABELS.easySessions,
  },
  {
    colorClassName: getColorClassName(SESSION_INTENSITY_COLORS[1], "bg"),
    description: "Sessions with an RPE from 4 to 6.",
    label: SESSION_INTENSITY_CATEGORY_LABELS.moderateSessions,
  },
  {
    colorClassName: getColorClassName(SESSION_INTENSITY_COLORS[2], "bg"),
    description: "Sessions with an RPE from 7 to 8.",
    label: SESSION_INTENSITY_CATEGORY_LABELS.hardSessions,
  },
  {
    colorClassName: getColorClassName(SESSION_INTENSITY_COLORS[3], "bg"),
    description: "Sessions with an RPE from 9 to 10.",
    label: SESSION_INTENSITY_CATEGORY_LABELS.veryHardSessions,
  },
];

export const RUN_MIX_DEFINITIONS = [
  {
    colorClassName: getColorClassName(RUN_MIX_COLORS[0], "bg"),
    description: "Total run miles around an easy/aerobic pace or effort.",
    label: RUN_MIX_CATEGORY_LABELS.aerobicMiles,
  },
  {
    colorClassName: getColorClassName(RUN_MIX_COLORS[3], "bg"),
    description:
      "Total run miles faster than estimated 5k pace (strides, sprints, hills).",
    label: RUN_MIX_CATEGORY_LABELS.speedMiles,
  },
  {
    colorClassName: getColorClassName(RUN_MIX_COLORS[1], "bg"),
    description: "Total run miles around a LT1 pace or effort.",
    label: RUN_MIX_CATEGORY_LABELS.lt1Miles,
  },
  {
    colorClassName: getColorClassName(RUN_MIX_COLORS[2], "bg"),
    description: "Total run miles around a LT2 pace or effort.",
    label: RUN_MIX_CATEGORY_LABELS.lt2Miles,
  },
  {
    colorClassName: getColorClassName(RUN_MIX_COLORS[4], "bg"),
    description: "Total run miles around 5k / VO2 pace or effort",
    label: RUN_MIX_CATEGORY_LABELS.vo2Miles,
  },
];

export const ROLLING_LOAD_DEFINITIONS = [
  {
    colorClassName: getColorClassName("chart-3", "bg"),
    description:
      "Subjective training load scaled 3x from RPE and workout duration.",
    label: "Subjective Training Load",
  },
  {
    colorClassName: getColorClassName("chart-1", "bg"),
    description: "Total hours of time actually training.",
    label: "True Training Hours",
  },
];

export const BASE_FITNESS_DEFINITIONS = [
  {
    colorClassName: getColorClassName("chart-3", "bg"),
    description:
      "Short-term training load smoothed with a 7-day time constant.",
    label: "Training Impact",
  },
  {
    colorClassName: getColorClassName("chart-2", "bg"),
    description:
      "Longer-term training load smoothed with a 42-day time constant.",
    label: "Base Fitness",
  },
];
