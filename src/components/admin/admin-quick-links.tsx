import {
  IconCalendarStats,
  IconFlag3,
  IconNotebook,
  IconTable,
  IconUserPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
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
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Tools
          </p>
          <h3 className="text-lg font-semibold tracking-tight">Quick Access</h3>
        </div>
      </div>

      <div className="border-primary/20 relative border-t pt-4">
        <div className="bg-primary/40 absolute top-0 left-0 h-0.5 w-16" />
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
              <Link
                className={buttonVariants({ className: "min-h-11" })}
                href="/admin/add-client"
              >
                <IconUserPlus aria-hidden />
                <span>Open Add Client</span>
              </Link>
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
              <Link
                className={buttonVariants({ className: "min-h-11" })}
                href="/admin/totals"
              >
                <IconTable aria-hidden />
                <span>Open Totals</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/20 from-card via-card to-muted/30 bg-gradient-to-br py-0 shadow-sm">
            <CardHeader className="px-4 pt-4 md:px-5 md:pt-5">
              <CardTitle className="text-base font-semibold tracking-tight">
                Manage Lab Notes
              </CardTitle>
              <CardDescription>
                Write, preview, publish, and hide posts from one workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-5 md:pb-5">
              <Link
                className={buttonVariants({ className: "min-h-11" })}
                href="/admin/posts"
              >
                <IconNotebook data-icon="inline-start" />
                <span>Open Lab Notes</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/20 from-card via-card to-muted/30 bg-gradient-to-br py-0 shadow-sm">
            <CardHeader className="px-4 pt-4 md:px-5 md:pt-5">
              <CardTitle className="text-base font-semibold tracking-tight">
                Manage Races
              </CardTitle>
              <CardDescription>
                Add HYROX, Elite 15, run races, and other events manually.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-5 md:pb-5">
              <Link
                className={buttonVariants({ className: "min-h-11" })}
                href="/admin/races"
              >
                <IconFlag3 data-icon="inline-start" />
                <span>Open Races</span>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/20 from-card via-card to-muted/30 bg-gradient-to-br py-0 shadow-sm">
            <CardHeader className="px-4 pt-4 md:px-5 md:pt-5">
              <CardTitle className="text-base font-semibold tracking-tight">
                Manage Training Blocks
              </CardTitle>
              <CardDescription>
                Set the dated focus that appears alongside Lab Notes.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 md:px-5 md:pb-5">
              <Link
                className={buttonVariants({ className: "min-h-11" })}
                href="/admin/blocks"
              >
                <IconCalendarStats data-icon="inline-start" />
                <span>Open Training Blocks</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
