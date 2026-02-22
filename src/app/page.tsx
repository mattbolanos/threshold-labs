import type { Metadata } from "next";
import { ROLLING_LOAD_DEFINITIONS, RUN_MIX_DEFINITIONS } from "@/app/constants";
import { DayHeaders } from "@/components/calendar/day-headers";
import { WeekBlocks } from "@/components/calendar/week-blocks";
import { WeekNavigation } from "@/components/calendar/week-navigation";
import { WeekRangeLabel } from "@/components/calendar/week-range-label";
import { ChartControls } from "@/components/chart/controls";
import { InfoPopover } from "@/components/chart/info-popover";
import { RollingLoadChart } from "@/components/chart/rolling-load";
import { RunMixChart } from "@/components/chart/run-mix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkAuth } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Review your training overview with run mix, load trends, and weekly workout schedule.",
  title: "Training Overview | Threshold Lab",
};

export default async function Home() {
  "use memo";

  await checkAuth();

  return (
    <div className="bg-background route-padding-y mx-auto flex max-w-[var(--max-app-width)] flex-col gap-6">
      {/* Performance Section Header */}
      <div className="route-padding-x flex items-end justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
            Performance
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            Training Overview
          </h2>
        </div>
        <ChartControls />
      </div>

      {/* Charts */}
      <div className="route-padding-x grid gap-4 lg:grid-cols-2">
        <Card className="w-full gap-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pl-5">
            <CardTitle className="text-sm font-medium">
              Run Volume Mix
            </CardTitle>
            <InfoPopover
              definitions={RUN_MIX_DEFINITIONS}
              title="Run Volume Mix"
            />
          </CardHeader>
          <CardContent>
            <RunMixChart />
          </CardContent>
        </Card>

        <Card className="w-full gap-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pl-5">
            <CardTitle className="text-sm font-medium">Training Load</CardTitle>
            <InfoPopover
              definitions={ROLLING_LOAD_DEFINITIONS}
              title="Training Load"
            />
          </CardHeader>
          <CardContent>
            <RollingLoadChart />
          </CardContent>
        </Card>
      </div>

      {/* Calendar Section */}
      <div className="route-padding-x mt-2 flex items-end justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
            Schedule
          </p>
          <WeekRangeLabel />
        </div>
        <WeekNavigation />
      </div>

      <div className="route-padding-x border-primary/20 relative border-t pt-4">
        <div className="bg-primary/40 absolute top-0 left-5 h-0.5 w-16 md:left-8" />
        <div className="flex min-h-[300px] flex-col gap-2 lg:min-h-[450px]">
          <DayHeaders />
          <WeekBlocks />
        </div>
      </div>
    </div>
  );
}
