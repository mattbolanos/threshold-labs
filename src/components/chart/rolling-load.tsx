"use client";

import * as React from "react";
import { ComboChart } from "@/components/ui/chart/combo-chart";
import { useChartState } from "@/hooks/use-chart-state";
import type { RollingLoadOutput } from "@/server/api/types";
import { api } from "@/trpc/react";

interface RollingLoadChartProps {
  initialDataPromise: Promise<RollingLoadOutput>;
}

export function RollingLoadChart({
  initialDataPromise,
}: RollingLoadChartProps) {
  const { range } = useChartState();
  const initialData = React.use(initialDataPromise);

  const [data] = api.internal.getRollingLoad.useSuspenseQuery(
    {
      from: range?.from ?? undefined,
      to: range?.to ?? undefined,
    },
    {
      initialData: range === null ? initialData : undefined,
    },
  );

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
      index="cycle"
      legendPosition="left"
      lineSeries={{
        categories: ["stl"],
        categoryLabels: {
          stl: "STL",
        },
        colors: ["blue"],
      }}
      showGridLines
      tooltipLabelFormatter={(label) => {
        return `Week of ${label}`;
      }}
      xAxisLabel="Cycle"
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
