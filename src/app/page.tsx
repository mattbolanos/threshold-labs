import { Suspense } from "react";
import { ROLLING_LOAD_DEFINITIONS, RUN_MIX_DEFINITIONS } from "@/app/constants";
import { CalendarArrows } from "@/components/calendar/calendar-arrows";
import { CalendarBlocks } from "@/components/calendar/calendar-blocks";
import { CalendarHeaderText } from "@/components/calendar/calendar-header-text";
import { DayBlocks } from "@/components/calendar/day-blocks";
import { ChartControls } from "@/components/chart/controls";
import { InfoPopover } from "@/components/chart/info-popover";
import { RollingLoadChart } from "@/components/chart/rolling-load";
import { RunMixChart } from "@/components/chart/run-mix";
import { CalendarHeaderSkeleton } from "@/components/skeletons/calendar-header";
import { ChartSkeleton } from "@/components/skeletons/chart";
import { ChartControlsSkeleton } from "@/components/skeletons/chart-controls";
import { DayBlocksSkeleton } from "@/components/skeletons/day-blocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";

export default function Home() {
  return (
    <div className="bg-background route-padding-y mx-auto flex max-w-7xl flex-col gap-4">
      <Suspense fallback={<ChartControlsSkeleton />}>
        <ChartControls />
      </Suspense>
      {/* Charts */}
      <div className="route-padding-x grid gap-4 lg:grid-cols-2">
        <Card className="w-full gap-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pl-6">
            <CardTitle>Run Volume Mix</CardTitle>
            <InfoPopover
              definitions={RUN_MIX_DEFINITIONS}
              title="Run Volume Mix"
            />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <RunMixChart
                initialDataPromise={api.internal.getRunVolumeMix({})}
              />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="w-full gap-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pl-6">
            <CardTitle>Training Load</CardTitle>
            <InfoPopover
              definitions={ROLLING_LOAD_DEFINITIONS}
              title="Training Load"
            />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <RollingLoadChart
                initialDataPromise={api.internal.getRollingLoad({})}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* CalendarHeader */}
      <div className="bg-background">
        <div className="route-padding-x flex items-center justify-between gap-4 py-2 md:flex-row">
          <Suspense fallback={<CalendarHeaderSkeleton />}>
            <CalendarHeaderText />
            <CalendarArrows
              workoutsDateRangePromise={api.internal.getWorkoutsDateRange()}
            />
          </Suspense>
        </div>
        <Separator className="data-[orientation=horizontal]:h-0.5 md:hidden" />
      </div>

      <div className="route-padding-x mt-4 flex flex-col gap-2 md:mt-0">
        <Suspense fallback={<DayBlocksSkeleton />}>
          <DayBlocks />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <CalendarBlocks />
        </Suspense>
      </div>
    </div>
  );
}
