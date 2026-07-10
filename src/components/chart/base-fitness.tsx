"use client";

import { useQuery } from "convex/react";
import { ChartSkeleton } from "@/components/skeletons/chart";
import { ComboChart } from "@/components/ui/chart/combo-chart";
import { useChartRange } from "@/hooks/use-chart-state";
import { api } from "../../../convex/_generated/api";

const Y_AXIS_PADDING_RATIO = 0.1;

const formatFitnessValue = (value: number) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });

const formatDate = (value: number | string) =>
  new Date(`${value}T00:00:00.000Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

const getPaddedYAxisDomain = (
  data: ReadonlyArray<{ baseFitness: number; trainingImpact: number }>,
) => {
  if (data.length === 0) {
    return { maxValue: undefined, minValue: undefined };
  }

  const fitnessValues = data.flatMap(({ baseFitness, trainingImpact }) => [
    baseFitness,
    trainingImpact,
  ]);
  const dataMin = Math.min(...fitnessValues);
  const dataMax = Math.max(...fitnessValues);

  return {
    maxValue: dataMax * (1 + Y_AXIS_PADDING_RATIO),
    minValue: Math.max(dataMin * (1 - Y_AXIS_PADDING_RATIO), Number.EPSILON),
  };
};

export interface BaseFitnessChartProps {
  yAxisWidth?: number;
}

export function BaseFitnessChart({ yAxisWidth }: BaseFitnessChartProps) {
  const range = useChartRange();

  const data = useQuery(api.workouts.getBaseFitness, {
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
  });

  if (data === undefined) {
    return <ChartSkeleton />;
  }

  const { maxValue, minValue } = getPaddedYAxisDomain(data);

  return (
    <ComboChart
      areaSeries={{
        categories: ["trainingImpact"],
        categoryLabels: {
          trainingImpact: "Training Impact",
        },
        colors: ["chart-1"],
        fillOpacity: 0.16,
        valueFormatter: formatFitnessValue,
      }}
      barSeries={{
        allowDecimals: false,
        categories: [],
        maxValue,
        minValue,
        valueFormatter: formatFitnessValue,
      }}
      data={data}
      index="date"
      leftYAxisWidth={yAxisWidth}
      legendPosition="left"
      lineSeries={{
        allowDecimals: false,
        categories: ["baseFitness"],
        categoryLabels: {
          baseFitness: "Base Fitness",
        },
        colors: ["chart-6"],
        isAnimationActive: false,
        valueFormatter: formatFitnessValue,
      }}
      showGridLines
      tickGap={16}
      tooltipLabelFormatter={formatDate}
      xAxisPadding={4}
      xTicksFormatter={formatDate}
    />
  );
}
