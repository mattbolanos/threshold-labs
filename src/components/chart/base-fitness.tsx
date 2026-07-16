"use client";

import { useQuery } from "convex/react";
import { useMemo } from "react";
import { ChartSkeleton } from "@/components/skeletons/chart";
import { ComboChart } from "@/components/ui/chart/combo-chart";
import { useChartRange } from "@/hooks/use-chart-state";
import { withTrainingBlockChartContext } from "@/lib/training-blocks";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import {
  renderTrainingBlockTooltipContext,
  TrainingBlockTimeline,
} from "./training-block-timeline";

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

const formatCompactDate = (value: number | string) =>
  new Date(`${value}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
    year: "2-digit",
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

export type BaseFitnessDataPoint = {
  baseFitness: number;
  dailyLoad: number;
  date: string;
  trainingImpact: number;
};

type BaseFitnessChartViewProps = BaseFitnessChartProps & {
  className?: string;
  compact?: boolean;
  data: BaseFitnessDataPoint[];
  trainingBlocks: Doc<"trainingBlocks">[];
};

export function BaseFitnessChartView({
  className,
  compact = false,
  data,
  trainingBlocks,
  yAxisWidth,
}: BaseFitnessChartViewProps) {
  const { maxValue, minValue } = getPaddedYAxisDomain(data);
  const chartData = useMemo(
    () => withTrainingBlockChartContext(data, trainingBlocks),
    [data, trainingBlocks],
  );
  const resolvedYAxisWidth = yAxisWidth ?? 48;

  return (
    <div
      className={cn(
        "relative h-64 w-full min-w-0 sm:h-60",
        compact && "h-44 sm:h-44",
        className,
      )}
    >
      <ComboChart
        areaSeries={{
          categories: ["trainingImpact"],
          categoryLabels: {
            trainingImpact: "Training Impact",
          },
          colors: ["chart-1"],
          fillOpacity: 0.16,
          showYAxis: !compact,
          valueFormatter: formatFitnessValue,
        }}
        barSeries={{
          allowDecimals: false,
          categories: [],
          maxValue,
          minValue,
          showYAxis: !compact,
          valueFormatter: formatFitnessValue,
        }}
        className="h-full min-w-0 sm:h-full"
        data={chartData}
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
          showYAxis: !compact,
          valueFormatter: formatFitnessValue,
        }}
        showGridLines
        showLegend={!compact}
        startEndOnly={compact}
        tickGap={16}
        tooltipContextFormatter={renderTrainingBlockTooltipContext}
        tooltipLabelFormatter={formatDate}
        xAxisPadding={compact ? 0 : 4}
        xTicksFormatter={compact ? formatCompactDate : formatDate}
      />
      <TrainingBlockTimeline
        data={chartData}
        leftOffset={compact ? 0 : resolvedYAxisWidth + 4}
        rightOffset={compact ? 0 : 4}
      />
    </div>
  );
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

  return (
    <BaseFitnessChartView
      data={data.data}
      trainingBlocks={data.trainingBlocks}
      yAxisWidth={yAxisWidth}
    />
  );
}
