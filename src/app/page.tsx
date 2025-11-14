import { Suspense } from "react";
import { CalendarArrows } from "@/components/calendar/calendar-arrows";
import { CalendarBlocks } from "@/components/calendar/calendar-blocks";
import { CalendarHeaderText } from "@/components/calendar/calendar-header-text";
import { DayBlocks } from "@/components/calendar/day-blocks";
import { ChartControls } from "@/components/chart/controls";
import { RollingLoadChart } from "@/components/chart/rolling-load";
import { RunMixChart } from "@/components/chart/run-mix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";

export default function Home() {
  return (
    <div className="bg-background route-padding-y flex flex-col gap-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ChartControls />
      </Suspense>
      {/* Charts */}
      <div className="route-padding-x grid gap-4 lg:grid-cols-2">
        <Card className="@container/card w-full gap-0">
          <CardHeader className="flex flex-col pl-6 @md/card:grid">
            <CardTitle>Run Volume Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <RunMixChart
                initialDataPromise={api.internal.getRunVolumeMix({})}
              />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="@container/card w-full gap-0">
          <CardHeader className="flex flex-col pl-6 @md/card:grid">
            <CardTitle>Training Load</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <RollingLoadChart
                initialDataPromise={api.internal.getRollingLoad({})}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* CalendarHeader */}
      <div className="bg-background sticky top-0 z-20">
        <div className="route-padding-x flex items-center justify-between gap-4 py-2 sm:py-4 md:flex-row">
          <Suspense fallback={<div>Loading...</div>}>
            <CalendarHeaderText />
            <CalendarArrows
              workoutsDateRangePromise={api.internal.getWorkoutsDateRange()}
            />
          </Suspense>
        </div>
        <Separator className="data-[orientation=horizontal]:h-0.5 md:hidden" />
      </div>

      <div className="route-padding-x mt-4 flex flex-col gap-2 md:mt-0">
        <Suspense fallback={<div>Loading...</div>}>
          <DayBlocks />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <CalendarBlocks />
        </Suspense>
      </div>
    </div>
  );
}
