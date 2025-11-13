import { parseAsJson, useQueryState } from "nuqs";
import { z } from "zod";

const dateRangeSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export function useChartState() {
  const [range, setRange] = useQueryState(
    "range",
    parseAsJson(dateRangeSchema),
  );

  return {
    range,
    setRange,
  };
}
