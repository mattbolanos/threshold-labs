"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { DEFAULT_RUN_MIX_RANGE } from "@/app/constants";
import {
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart } from "@/components/ui/chart/bar-chart";
import { useChartState } from "@/hooks/use-chart-state";
import { getColorClassName } from "@/lib/chart-utils";
import type { RunVolumeMixOutput } from "@/server/api/types";
import { api } from "@/trpc/react";
import { CalendarFilter } from "./calendar-filter";
import { createTooltip } from "./tooltip";

const RUN_MIX_CATEGORIES = [
  "speedMiles",
  "easyMiles",
  "tempoMiles",
  "thresholdMiles",
  "vo2Miles",
] as const;

type RunMixCategory = (typeof RUN_MIX_CATEGORIES)[number];

const RUN_MIX_CATEGORY_LABELS: Record<RunMixCategory, string> = {
  easyMiles: "Easy Miles",
  speedMiles: "Speed Miles",
  tempoMiles: "Tempo Miles",
  thresholdMiles: "Threshold Miles",
  vo2Miles: "VO2 Miles",
};

const RunMixTooltip = createTooltip(
  RUN_MIX_CATEGORIES.map((dataKey) => ({
    dataKey,
    label: RUN_MIX_CATEGORY_LABELS[dataKey].replace(" Miles", ""),
  })),
  {
    formatLabelTitle: (value) => `Week of ${value}`,
    renderContent: ({ payload, categories }) => {
      const sortedPayload = payload
        .filter((item) => Number(item.value) !== 0)
        .sort((a, b) => Number(b.value) - Number(a.value));

      return categories
        .filter(({ dataKey }) =>
          sortedPayload.some((item) => item.dataKey === dataKey),
        )
        .sort(({ dataKey: dataKeyA }, { dataKey: dataKeyB }) => {
          const valueA =
            sortedPayload.find((item) => item.dataKey === dataKeyA)?.value ?? 0;
          const valueB =
            sortedPayload.find((item) => item.dataKey === dataKeyB)?.value ?? 0;
          return Number(valueB) - Number(valueA);
        })
        .map(({ dataKey, label }) => {
          const payloadItem = payload.find((item) => item.dataKey === dataKey);
          if (!payloadItem) return null;
          if (Number(payloadItem.value) === 0) return null;

          const displayLabel = label ?? payloadItem.category ?? dataKey;
          const formattedValue = Number(payloadItem.value).toLocaleString(
            "en-US",
            {
              maximumFractionDigits: 1,
              minimumFractionDigits: 0,
            },
          );
          const totalMiles = payloadItem.payload?.totalMiles || 1;
          const percentage = (
            (Number(payloadItem.value) / totalMiles) *
            100
          ).toLocaleString("en-US", {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
          });
          const colorClassName = payloadItem.color
            ? getColorClassName(payloadItem.color, "bg")
            : "bg-gray-300";

          return (
            <div className="flex items-center justify-between" key={dataKey}>
              <div className="flex items-center space-x-1.5">
                <span
                  aria-hidden="true"
                  className={`size-3 shrink-0 rounded-xs ${colorClassName}`}
                />
                <span>{displayLabel}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm tabular-nums">
                <span>{formattedValue}</span>
                <span className="text-muted-foreground">({percentage}%)</span>
              </div>
            </div>
          );
        });
    },
  },
);

export function RunMixChart() {
  const { runMixRange, setRunMixRange } = useChartState();

  const [data] = api.internal.getRunVolumeMix.useSuspenseQuery({
    from: runMixRange.from,
    to: runMixRange.to ?? undefined,
  });

  return (
    <>
      <CardHeader className="mb-1 flex flex-col pl-4 @md/card:grid">
        <CardTitle>Run Volume Mix</CardTitle>
        <CardDescription>Total miles run split by category.</CardDescription>
        <CardAction>
          <CalendarFilter
            defaultRange={DEFAULT_RUN_MIX_RANGE}
            range={runMixRange}
            setRange={setRunMixRange}
          />
        </CardAction>
      </CardHeader>

      <CardContent>
        <BarChart
          barCategoryGap={12}
          categories={[...RUN_MIX_CATEGORIES]}
          categoryLabels={RUN_MIX_CATEGORY_LABELS}
          customTooltip={RunMixTooltip}
          data={data}
          index="cycle"
          type="stacked"
          xAxisLabel="Cycle"
          xTicksFormatter={(value) =>
            new Date(value).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              timeZone: "UTC",
            })
          }
        />
      </CardContent>
    </>
  );
}
