import type { Metadata } from "next";
import {
  BASE_FITNESS_DEFINITIONS,
  ROLLING_LOAD_DEFINITIONS,
  RUN_MIX_DEFINITIONS,
  SESSION_INTENSITY_DEFINITIONS,
} from "@/app/constants";
import { DesktopWeekSummary } from "@/components/calendar/desktop-week-summary";
import { MobileWeekSummary } from "@/components/calendar/mobile-week-summary";
import { TrainingPageHeader } from "@/components/calendar/training-page-header";
import { WeekBlocks } from "@/components/calendar/week-blocks";
import { WeekRangeLabel } from "@/components/calendar/week-range-label";
import { BaseFitnessChart } from "@/components/chart/base-fitness";
import { ChartCard } from "@/components/chart/chart-card";
import { ChartControls } from "@/components/chart/controls";
import { RollingLoadChart } from "@/components/chart/rolling-load";
import { RunMixChart } from "@/components/chart/run-mix";
import { SessionIntensityChart } from "@/components/chart/session-intensity";
import { Separator } from "@/components/ui/separator";
import { ChartStateProvider } from "@/hooks/use-chart-state";
import { checkAuth } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Review your training overview with run mix, load trends, and weekly workout schedule.",
  title: "Training Overview | Threshold Lab",
};

export default async function TrainingPage() {
  await checkAuth({ allowUnauthenticatedPreview: true });

  return (
    <div className="route-padding-y mx-auto flex max-w-7xl flex-col gap-4 bg-background">
      <TrainingPageHeader />

      <section className="route-padding-x">
        <div className="rounded-xl border bg-card px-4 pt-4 pb-5 text-card-foreground shadow-lg lg:min-h-90 lg:px-5 lg:pt-4 lg:pb-5">
          <div className="mb-3.5 flex items-start gap-6">
            <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 lg:w-fit">
              <h2 className="text-lg font-bold">Schedule</h2>
              <WeekRangeLabel />
            </div>
            <DesktopWeekSummary />
          </div>
          <MobileWeekSummary />
          <WeekBlocks />
        </div>
      </section>

      <div className="route-padding-x">
        <Separator className="lg:hidden" />
      </div>

      <ChartStateProvider>
        <div className="route-padding-x flex items-center justify-between">
          <h3 className="hidden text-2xl font-semibold lg:block">Summaries</h3>
          <ChartControls />
        </div>
        <section className="route-padding-x grid gap-4 lg:grid-cols-2">
          <ChartCard
            definitions={BASE_FITNESS_DEFINITIONS}
            description="42d base fitness vs 7d training impact."
            infoTitle="Base Fitness"
            title="Base Fitness + Impact"
          >
            <BaseFitnessChart yAxisWidth={32} />
          </ChartCard>

          <ChartCard
            definitions={SESSION_INTENSITY_DEFINITIONS}
            description="Weekly session share by RPE band."
            title="Session Intensity"
          >
            <SessionIntensityChart />
          </ChartCard>

          <ChartCard
            definitions={RUN_MIX_DEFINITIONS}
            description="Easy, quality, trail, warmup/cooldown."
            title="Run Volume Mix"
          >
            <RunMixChart yAxisWidth={30} />
          </ChartCard>

          <ChartCard
            definitions={ROLLING_LOAD_DEFINITIONS}
            description="Weekly load with target range."
            title="Training Load"
          >
            <RollingLoadChart leftYAxisWidth={36} />
          </ChartCard>
        </section>
      </ChartStateProvider>
    </div>
  );
}
