"use client";

import { useChartState } from "@/hooks/use-chart-state";
import { DateFilter } from "./date-filter";

export function ChartControls() {
  const { range, setRange } = useChartState();

  return (
    <div className="flex items-center">
      <DateFilter range={range} setRange={setRange} />
    </div>
  );
}
