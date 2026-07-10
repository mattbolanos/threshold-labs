import type { Metadata } from "next";
import {
  BASE_FITNESS_DEFINITIONS,
  ROLLING_LOAD_DEFINITIONS,
  RUN_MIX_DEFINITIONS,
  SESSION_INTENSITY_DEFINITIONS,
} from "@/app/constants";
import { MobileWeekSummary } from "@/components/calendar/mobile-week-summary";
import { TrainingPageHeader } from "@/components/calendar/training-page-header";
import { WeekBlocks } from "@/components/calendar/week-blocks";
import { WeekRangeLabel } from "@/components/calendar/week-range-label";
import { BaseFitnessChart } from "@/components/chart/base-fitness";
import { ChartControls } from "@/components/chart/controls";
import { InfoPopover } from "@/components/chart/info-popover";
import { RollingLoadChart } from "@/components/chart/rolling-load";
import { RunMixChart } from "@/components/chart/run-mix";
import { SessionIntensityChart } from "@/components/chart/session-intensity";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChartStateProvider } from "@/hooks/use-chart-state";
import { checkAuth } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Review your training overview with run mix, load trends, and weekly workout schedule.",
  title: "Training Overview | Threshold Lab",
};

export default async function Home() {
  await checkAuth({ allowUnauthenticatedPreview: true });

  return (
    <div className="route-padding-y mx-auto flex max-w-7xl flex-col gap-4 bg-background">
      <TrainingPageHeader />

      {/* Calendar Section */}
      <section className="route-padding-x">
        <div className="rounded-xl border bg-card px-4 pt-4 pb-5 text-card-foreground shadow-lg lg:min-h-90 lg:px-5 lg:pt-4 lg:pb-5">
          <div className="mb-3.5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h2 className="text-lg font-bold">Schedule</h2>
              <WeekRangeLabel />
            </div>
          </div>
          <MobileWeekSummary />
          <WeekBlocks />
        </div>
      </section>

      {/* Analytics */}
      <div className="route-padding-x">
        <Separator className="lg:hidden" />
      </div>

      <ChartStateProvider>
        <div className="route-padding-x flex items-center justify-between">
          <h3 className="hidden text-2xl font-semibold lg:block">Summaries</h3>
          <ChartControls />
        </div>
        <section className="route-padding-x grid gap-4 lg:grid-cols-2">
          <Card className="min-h-54 w-full gap-0 rounded-xl py-0">
            <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pt-4 pb-0">
              <div className="min-w-0">
                <CardTitle className="text-base font-bold">
                  Base Fitness + Impact
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  42d base fitness vs 7d training impact.
                </CardDescription>
              </div>
              <InfoPopover
                definitions={BASE_FITNESS_DEFINITIONS}
                title="Base Fitness"
              />
            </CardHeader>
            <CardContent className="px-5 pb-3">
              <BaseFitnessChart yAxisWidth={32} />
            </CardContent>
          </Card>

          <Card className="min-h-54 w-full gap-0 rounded-xl py-0">
            <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pt-4 pb-0">
              <div className="min-w-0">
                <CardTitle className="text-base font-bold">
                  Session Intensity
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Weekly session share by RPE band.
                </CardDescription>
              </div>
              <InfoPopover
                definitions={SESSION_INTENSITY_DEFINITIONS}
                title="Session Intensity"
              />
            </CardHeader>
            <CardContent className="px-5 pb-3">
              <SessionIntensityChart />
            </CardContent>
          </Card>

          <Card className="min-h-54 w-full gap-0 rounded-xl py-0">
            <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pt-4 pb-0">
              <div className="min-w-0">
                <CardTitle className="text-base font-bold">
                  Run Volume Mix
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Easy, quality, trail, warmup/cooldown.
                </CardDescription>
              </div>
              <InfoPopover
                definitions={RUN_MIX_DEFINITIONS}
                title="Run Volume Mix"
              />
            </CardHeader>
            <CardContent className="px-5 pb-3">
              <RunMixChart yAxisWidth={30} />
            </CardContent>
          </Card>

          <Card className="min-h-54 w-full gap-0 rounded-xl py-0">
            <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pt-4 pb-0">
              <div className="min-w-0">
                <CardTitle className="text-base font-bold">
                  Training Load
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Weekly load with target range.
                </CardDescription>
              </div>
              <InfoPopover
                definitions={ROLLING_LOAD_DEFINITIONS}
                title="Training Load"
              />
            </CardHeader>
            <CardContent className="px-5 pb-3">
              <RollingLoadChart leftYAxisWidth={36} />
            </CardContent>
          </Card>
        </section>
      </ChartStateProvider>
    </div>
  );
}
