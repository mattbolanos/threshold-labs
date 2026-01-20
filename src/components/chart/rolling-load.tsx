"use client";

import { useQuery } from "convex/react";
import { ComboChart } from "@/components/ui/chart/combo-chart";
import { useChartState } from "@/hooks/use-chart-state";
import { api } from "../../../convex/_generated/api";

export function RollingLoadChart() {
  const { range } = useChartState();

  const data = useQuery(api.workouts.getRollingLoad, {
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
  });

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
      data={data ?? []}
      enableBiaxial={true}
      index="week"
      legendPosition="left"
      lineSeries={{
        categories: ["stl"],
        categoryLabels: {
          stl: "Subjective Training Load",
        },
        colors: ["chart-3"],
      }}
      showGridLines
      tooltipLabelFormatter={(label) => {
        return `Week of ${label}`;
      }}
      xAxisLabel="Week"
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
