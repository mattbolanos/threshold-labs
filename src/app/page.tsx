import { Suspense } from "react";
import { CalendarArrows } from "@/components/calendar/calendar-arrows";
import { CalendarBlocks } from "@/components/calendar/calendar-blocks";
import { CalendarHeaderText } from "@/components/calendar/calendar-header-text";
import { DayBlocks } from "@/components/calendar/day-blocks";
import { RunMixChart } from "@/components/chart/run-mix";
import { ComboChartSingleAxisExample } from "@/components/chart/test-chart";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";

export default function Home() {
  return (
    <div className="bg-background route-padding-y flex flex-col gap-4">
      <div className="grid gap-4 px-5 md:px-8 lg:grid-cols-2">
        <Card>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <RunMixChart
                initialDataPromise={api.internal.getRunVolumeMix()}
              />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <ComboChartSingleAxisExample />
          </CardContent>
        </Card>
      </div>
      {/* Header */}
      <div className="bg-background sticky top-0 z-20">
        <div className="flex items-center justify-between gap-4 px-5 py-2 sm:py-4 md:flex-row md:px-8">
          <Suspense fallback={<div>Loading...</div>}>
            <CalendarHeaderText />
            <CalendarArrows
              workoutsDateRangePromise={api.internal.getWorkoutsDateRange()}
            />
          </Suspense>
        </div>
        <Separator className="data-[orientation=horizontal]:h-0.5 md:hidden" />
      </div>

      <div className="mt-4 flex flex-col gap-2 px-5 md:mt-0 md:px-8">
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
