import type { Metadata } from "next";
import {
  BASE_FITNESS_DEFINITIONS,
  ROLLING_LOAD_DEFINITIONS,
  RUN_MIX_DEFINITIONS,
} from "@/app/constants";
import { SelectedWeekSummary } from "@/components/block/selected-week-summary";
import { TrainingPageHeader } from "@/components/calendar/training-page-header";
import { WeekBlocks } from "@/components/calendar/week-blocks";
import { WeekRangeLabel } from "@/components/calendar/week-range-label";
import { BaseFitnessChart } from "@/components/chart/base-fitness";
import { InfoPopover } from "@/components/chart/info-popover";
import { RollingLoadChart } from "@/components/chart/rolling-load";
import { RunMixChart } from "@/components/chart/run-mix";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { checkAuth } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Review your training overview with run mix, load trends, and weekly workout schedule.",
  title: "Training Overview | Threshold Lab",
};

export default async function Home() {
  await checkAuth({ allowUnauthenticatedPreview: true });

  return (
    <div className="bg-background route-padding-y mx-auto flex max-w-7xl flex-col gap-4">
      <TrainingPageHeader />

      {/* Calendar Section */}
      <section className="route-padding-x">
        <div className="rounded-[10px] border border-[#1d2721] bg-[#030605] px-4 pt-4 pb-5 text-[#ecf1e9] shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:min-h-87 lg:px-[19px] lg:pt-[17px] lg:pb-[21px]">
          <div className="mb-[14px] flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-baseline gap-x-[17px] gap-y-1">
              <h2 className="text-[18px] leading-[23px] font-bold text-[#ecf1e9]">
                Schedule
              </h2>
              <WeekRangeLabel />
            </div>
          </div>
          <WeekBlocks />
        </div>
      </section>

      {/* Analytics */}
      <section className="route-padding-x grid gap-4 md:grid-cols-2">
        <SelectedWeekSummary />

        <Card className="min-h-[218px] w-full gap-0 rounded-[10px] border border-[#1d2721] bg-[#060a08] py-0 text-[#ecf1e9]">
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-[19px] pt-[17px] pb-0">
            <div className="min-w-0">
              <CardTitle className="text-[17px] leading-[21px] font-bold text-[#ecf1e9]">
                Base Fitness + Impact
              </CardTitle>
              <CardDescription className="mt-1 text-[12px] leading-[15px] text-[#839288]">
                42d base fitness vs 7d training impact.
              </CardDescription>
            </div>
            <InfoPopover
              definitions={BASE_FITNESS_DEFINITIONS}
              title="Base Fitness"
            />
          </CardHeader>
          <CardContent className="px-[19px] pt-2 pb-3">
            <BaseFitnessChart />
          </CardContent>
        </Card>

        <Card className="min-h-[218px] w-full gap-0 rounded-[10px] border border-[#1d2721] bg-[#060a08] py-0 text-[#ecf1e9]">
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-[19px] pt-[17px] pb-0">
            <div className="min-w-0">
              <CardTitle className="text-[17px] leading-[21px] font-bold text-[#ecf1e9]">
                Run Volume Mix
              </CardTitle>
              <CardDescription className="mt-1 text-[12px] leading-[15px] text-[#839288]">
                Easy, quality, trail, warmup/cooldown.
              </CardDescription>
            </div>
            <InfoPopover
              definitions={RUN_MIX_DEFINITIONS}
              title="Run Volume Mix"
            />
          </CardHeader>
          <CardContent className="px-[19px] pt-2 pb-3">
            <RunMixChart />
          </CardContent>
        </Card>

        <Card className="min-h-[218px] w-full gap-0 rounded-[10px] border border-[#1d2721] bg-[#060a08] py-0 text-[#ecf1e9]">
          <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-[19px] pt-[17px] pb-0">
            <div className="min-w-0">
              <CardTitle className="text-[17px] leading-[21px] font-bold text-[#ecf1e9]">
                Training Load
              </CardTitle>
              <CardDescription className="mt-1 text-[12px] leading-[15px] text-[#839288]">
                Weekly load with target range.
              </CardDescription>
            </div>
            <InfoPopover
              definitions={ROLLING_LOAD_DEFINITIONS}
              title="Training Load"
            />
          </CardHeader>
          <CardContent className="px-[19px] pt-2 pb-3">
            <RollingLoadChart />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
