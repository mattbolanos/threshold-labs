import { addWeeks, startOfWeek } from "date-fns";
import {
  type AvailableChartColorsKeys,
  chartColors,
  getColorClassName,
} from "@/lib/chart-utils";
import { formatQueryDate } from "@/lib/utils";

export type RunMixCategory =
  | "aerobicMiles"
  | "speedMiles"
  | "tempoMiles"
  | "thresholdMiles"
  | "vo2Miles";

export const DEFAULT_CHART_RANGE = {
  from: formatQueryDate(
    addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), -18),
  ),
  to: formatQueryDate(new Date()),
};

export const RUN_MIX_CATEGORY_LABELS: Record<RunMixCategory, string> = {
  aerobicMiles: "Aerobic Miles",
  speedMiles: "Speed Miles",
  tempoMiles: "Tempo Miles",
  thresholdMiles: "Threshold Miles",
  vo2Miles: "VO2 Miles",
};

const chartColorsArray = Object.keys(chartColors) as AvailableChartColorsKeys[];

export const RUN_MIX_DEFINITIONS = [
  {
    colorClassName: getColorClassName(chartColorsArray[0], "bg"),
    description: "Low intensity running that builds endurance.",
    label: RUN_MIX_CATEGORY_LABELS.aerobicMiles,
  },
  {
    colorClassName: getColorClassName(chartColorsArray[1], "bg"),
    description: "High intensity intervals to improve speed and power.",
    label: RUN_MIX_CATEGORY_LABELS.speedMiles,
  },
  {
    colorClassName: getColorClassName(chartColorsArray[2], "bg"),
    description: "Sustained effort at lactate threshold.",
    label: RUN_MIX_CATEGORY_LABELS.tempoMiles,
  },
  {
    colorClassName: getColorClassName(chartColorsArray[3], "bg"),
    description: "Training at the fastest pace you can sustain aerobically.",
    label: RUN_MIX_CATEGORY_LABELS.thresholdMiles,
  },
  {
    colorClassName: getColorClassName(chartColorsArray[4], "bg"),
    description: "Maximum effort intervals to increase VO2 max.",
    label: RUN_MIX_CATEGORY_LABELS.vo2Miles,
  },
];

export const ROLLING_LOAD_DEFINITIONS = [
  {
    colorClassName: getColorClassName(chartColorsArray[0], "bg"),
    description:
      "Subjective training load is a subjective measure of how hard you worked during a workout.",
    label: "Subjective Training Load",
  },
  {
    colorClassName: getColorClassName(chartColorsArray[1], "bg"),
    description:
      "True training hours are the total hours of running that you actually did.",
    label: "True Training Hours",
  },
];
