"use client";

import { useQuery } from "convex/react";
import { RUN_MIX_CATEGORY_LABELS, type RunMixCategory } from "@/app/constants";
import { BarChart } from "@/components/ui/chart/bar-chart";
import { useChartState } from "@/hooks/use-chart-state";
import { getColorClassName } from "@/lib/chart-utils";
import { api } from "../../../convex/_generated/api";
import { createTooltip } from "./tooltip";

export function RunMixChart() {
  const { range } = useChartState();

  const data = useQuery(api.workouts.getRunVolumeMix, {
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
  });

  return (
    <BarChart
      categories={[...Object.keys(RUN_MIX_CATEGORY_LABELS)]}
      categoryLabels={RUN_MIX_CATEGORY_LABELS}
      customTooltip={RunMixTooltip}
      data={data ?? []}
      index="week"
      legendPosition="left"
      type="stacked"
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

const RunMixTooltip = createTooltip(
  Object.keys(RUN_MIX_CATEGORY_LABELS).map((dataKey) => ({
    dataKey,
    label: RUN_MIX_CATEGORY_LABELS[dataKey as RunMixCategory].replace(
      " Miles",
      "",
    ),
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
              minimumFractionDigits: 1,
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
