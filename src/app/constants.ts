import {
  type AvailableChartColorsKeys,
  chartColors,
  getColorClassName,
} from "@/lib/chart-utils";

export type RunMixCategory =
  | "aerobicMiles"
  | "speedMiles"
  | "lt1Miles"
  | "lt2Miles"
  | "vo2Miles";

export const RUN_MIX_CATEGORY_LABELS: Record<RunMixCategory, string> = {
  aerobicMiles: "Aerobic Miles",
  lt1Miles: "LT1 Miles",
  lt2Miles: "LT2 Miles",
  speedMiles: "Speed Miles",
  vo2Miles: "VO2 Miles",
};

const chartColorsArray = Object.keys(chartColors) as AvailableChartColorsKeys[];

export const RUN_MIX_DEFINITIONS = [
  {
    colorClassName: getColorClassName(chartColorsArray[0], "bg"),
    description: "Total run miles around an easy/aerobic pace or effort.",
    label: RUN_MIX_CATEGORY_LABELS.aerobicMiles,
  },
  {
    colorClassName: getColorClassName(chartColorsArray[1], "bg"),
    description:
      "Total run miles faster than estimated 5k pace (strides, sprints, hills).",
    label: RUN_MIX_CATEGORY_LABELS.speedMiles,
  },
  {
    colorClassName: getColorClassName(chartColorsArray[2], "bg"),
    description: "Total run miles around a LT1 pace or effort.",
    label: RUN_MIX_CATEGORY_LABELS.lt1Miles,
  },
  {
    colorClassName: getColorClassName(chartColorsArray[3], "bg"),
    description: "Total run miles around a LT2 pace or effort.",
    label: RUN_MIX_CATEGORY_LABELS.lt2Miles,
  },
  {
    colorClassName: getColorClassName(chartColorsArray[4], "bg"),
    description: "Total run miles around 5k / VO2 pace or effort",
    label: RUN_MIX_CATEGORY_LABELS.vo2Miles,
  },
];

export const ROLLING_LOAD_DEFINITIONS = [
  {
    colorClassName: getColorClassName(chartColorsArray[0], "bg"),
    description: "Subjective training load based on RPE and workout duration.",
    label: "Subjective Training Load",
  },
  {
    colorClassName: getColorClassName(chartColorsArray[1], "bg"),
    description: "Total hours of time actually training.",
    label: "True Training Hours",
  },
];
