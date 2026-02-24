import { IconTable, IconUserPlus } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AdminQuickLinks() {
  return (
    <>
      <div className="route-padding-x flex items-end justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
            Tools
          </p>
          <h3 className="text-lg font-semibold tracking-tight">Quick Access</h3>
        </div>
      </div>

      <div className="route-padding-x border-primary/20 relative border-t pt-4">
        <div className="bg-primary/40 absolute top-0 left-5 h-0.5 w-16 md:left-8" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-primary/20 from-card via-card to-muted/30 bg-gradient-to-br py-0 shadow-sm">
            <CardHeader className="px-4 pt-4 md:px-5 md:pt-5">
              <CardTitle className="text-base font-semibold tracking-tight">
                Manage Client Invites
              </CardTitle>
              <CardDescription>
                Create or update signup invites for clients and coaches.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-5 md:pb-5">
              <Button asChild className="min-h-11">
                <Link href="/admin/add-client">
                  <IconUserPlus aria-hidden />
                  <span>Open Add Client</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 from-card via-card to-muted/30 bg-gradient-to-br py-0 shadow-sm">
            <CardHeader className="px-4 pt-4 md:px-5 md:pt-5">
              <CardTitle className="text-base font-semibold tracking-tight">
                Weekly Totals
              </CardTitle>
              <CardDescription>
                View aggregated training metrics by week with charts.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-5 md:pb-5">
              <Button asChild className="min-h-11">
                <Link href="/admin/totals">
                  <IconTable aria-hidden />
                  <span>Open Totals</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
