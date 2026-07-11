"use client";

import { useQuery } from "convex/react";
import { ChartSkeleton } from "@/components/skeletons/chart";
import { ComboChart } from "@/components/ui/chart/combo-chart";
import { useChartRange } from "@/hooks/use-chart-state";
import { api } from "../../../convex/_generated/api";

export interface RollingLoadChartProps {
  leftYAxisWidth?: number;
  rightYAxisWidth?: number;
}

export function RollingLoadChart({
  leftYAxisWidth,
  rightYAxisWidth = 56,
}: RollingLoadChartProps) {
  const range = useChartRange();

  const data = useQuery(api.workouts.getRollingLoad, {
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
  });

  // Loading state - show skeleton while data is undefined
  if (data === undefined) {
    return <ChartSkeleton />;
  }

  return (
    <ComboChart
      barSeries={{
        categories: ["trueTrainingHours"],
        categoryLabels: {
          trueTrainingHours: "True Training Hours",
        },
        valueFormatter: (value) => {
          return `${value.toFixed(1)}`;
        },
      }}
      data={data}
      enableBiaxial={true}
      index="week"
      leftYAxisWidth={leftYAxisWidth}
      legendPosition="left"
      lineSeries={{
        categories: ["stl"],
        categoryLabels: {
          stl: "Subjective Training Load",
        },
        colors: ["chart-6"],
        valueFormatter: (value) => {
          return `${value.toFixed(1)}`;
        },
      }}
      rightYAxisWidth={rightYAxisWidth}
      showGridLines
      tooltipLabelFormatter={(label) => {
        return `Week of ${label}`;
      }}
      xAxisPadding={4}
      xTicksFormatter={(value) =>
        new Date(value).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        })
      }
    />
  );
}
