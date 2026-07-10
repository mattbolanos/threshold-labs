"use client";

import { useQuery } from "convex/react";
import {
  SESSION_INTENSITY_CATEGORY_LABELS,
  SESSION_INTENSITY_COLORS,
} from "@/app/constants";
import { ChartSkeleton } from "@/components/skeletons/chart";
import { BarChart } from "@/components/ui/chart/bar-chart";
import { useChartRange } from "@/hooks/use-chart-state";
import { api } from "../../../convex/_generated/api";
import { createTooltip } from "./tooltip";

const categories = [
  "easySessions",
  "moderateSessions",
  "hardSessions",
  "veryHardSessions",
];

export interface SessionIntensityChartProps {
  yAxisWidth?: number;
}

export function SessionIntensityChart({
  yAxisWidth,
}: SessionIntensityChartProps) {
  const range = useChartRange();
  const data = useQuery(api.workouts.getSessionIntensity, {
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
  });

  if (data === undefined) {
    return <ChartSkeleton />;
  }

  return (
    <BarChart
      allowDecimals={false}
      categories={categories}
      categoryLabels={SESSION_INTENSITY_CATEGORY_LABELS}
      colors={SESSION_INTENSITY_COLORS}
      customTooltip={SessionIntensityTooltip}
      data={data}
      index="week"
      legendPosition="left"
      type="percent"
      xAxisPadding={4}
      xTicksFormatter={(value) =>
        new Date(value).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        })
      }
      yAxisWidth={yAxisWidth}
    />
  );
}

const SessionIntensityTooltip = createTooltip(
  categories.map((dataKey) => ({
    dataKey,
    label:
      SESSION_INTENSITY_CATEGORY_LABELS[
        dataKey as keyof typeof SESSION_INTENSITY_CATEGORY_LABELS
      ],
    valueFormatter: ({ payload, value }) => {
      const total = categories.reduce(
        (sum, category) => sum + Number(payload.payload?.[category] ?? 0),
        0,
      );
      const count = Number(value);
      const percentage = total === 0 ? 0 : Math.round((count / total) * 100);

      return `${percentage}% · ${count} ${count === 1 ? "session" : "sessions"}`;
    },
  })),
  { formatLabelTitle: (value) => `Week of ${value}` },
);
