import type { Metadata } from "next";
import { ROLLING_LOAD_DEFINITIONS, RUN_MIX_DEFINITIONS } from "@/app/constants";
import { AdminBackLink } from "@/components/admin/admin-back-link";
import { ChartControls } from "@/components/chart/controls";
import { InfoPopover } from "@/components/chart/info-popover";
import { RollingLoadChart } from "@/components/chart/rolling-load";
import { RunMixChart } from "@/components/chart/run-mix";
import { TotalsTable } from "@/components/totals/totals-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkAuth } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Weekly training totals and performance dashboard.",
  title: "Totals | Admin",
};

export default async function TotalsPage() {
  "use memo";

  await checkAuth();

  return (
    <>
      <div className="route-padding-x">
        <AdminBackLink />
      </div>

      <div className="route-padding-x flex items-end justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
            Admin
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            Weekly Totals
          </h2>
        </div>
        <ChartControls />
      </div>

      <div className="route-padding-x grid gap-4 lg:grid-cols-2">
        <Card className="w-full gap-0 overflow-hidden lg:col-span-2">
          <CardHeader className="pl-5">
            <CardTitle className="text-sm font-medium">Weekly Totals</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <TotalsTable />
          </CardContent>
        </Card>

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
    </>
  );
}
