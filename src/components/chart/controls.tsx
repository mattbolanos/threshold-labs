"use client";

import { useChartState } from "@/hooks/use-chart-state";
import { DateFilter } from "./date-filter";

export function ChartControls() {
  const { range, setRange } = useChartState();

  return (
    <div className="route-padding-x flex items-center justify-end">
      <DateFilter range={range} setRange={setRange} />
    </div>
  );
}
