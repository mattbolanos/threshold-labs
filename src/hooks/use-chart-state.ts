import { parseAsJson, useQueryState } from "nuqs";
import { z } from "zod";
import { DEFAULT_RUN_MIX_RANGE } from "@/app/constants";

const dateRangeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export function useChartState() {
  const [runMixRange, setRunMixRange] = useQueryState(
    "runMixRange",
    parseAsJson(dateRangeSchema).withDefault(DEFAULT_RUN_MIX_RANGE),
  );

  return {
    runMixRange,
    setRunMixRange,
  };
}
