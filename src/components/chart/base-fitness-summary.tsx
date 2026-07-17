"use client";

import { useQuery } from "convex/react";
import { subYears } from "date-fns";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatQueryDate } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import { BaseFitnessChartView } from "./base-fitness";

const formatFitness = (value: number) => Math.round(value).toLocaleString();

export function BaseFitnessSummary() {
  const range = useMemo(() => {
    const to = new Date();
    return {
      from: formatQueryDate(subYears(to, 1)),
      to: formatQueryDate(to),
    };
  }, []);
  const data = useQuery(api.workouts.getBaseFitness, range);

  if (data === undefined) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  const first = data.data[0];
  const latest = data.data.at(-1);
  const change = first && latest ? latest.baseFitness - first.baseFitness : 0;

  return (
    <Card className="min-w-0" size="sm">
      <CardHeader>
        <CardTitle>Base fitness</CardTitle>
        <CardDescription>
          42-day fitness across the last 12 months.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-2">
        {latest ? (
          <>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-xs">Current</p>
                <p className="font-mono text-2xl font-semibold tabular-nums">
                  {formatFitness(latest.baseFitness)}
                </p>
              </div>
              <p className="text-muted-foreground pb-1 font-mono text-xs tabular-nums">
                12mo {change >= 0 ? "+" : ""}
                {formatFitness(change)}
              </p>
            </div>
            <BaseFitnessChartView
              compact
              data={data.data}
              trainingBlocks={data.trainingBlocks}
            />
          </>
        ) : (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Add workout history to build the 12-month trend.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
