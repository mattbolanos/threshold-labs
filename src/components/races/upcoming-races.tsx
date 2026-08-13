import { Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateRange } from "@/lib/race-dates";
import { getRaceTypeLabel } from "@/lib/races";
import type { Doc } from "../../../convex/_generated/dataModel";

export function UpcomingRacesSkeleton() {
  return <Skeleton className="h-52 w-full rounded-xl" />;
}

type UpcomingRacesProps = {
  races?: Doc<"races">[] | null;
};

export function UpcomingRaces({ races }: UpcomingRacesProps) {
  const upcomingRaces = races ?? [];

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Upcoming races</CardTitle>
        {upcomingRaces.length === 0 ? (
          <CardDescription>Nothing on the calendar yet.</CardDescription>
        ) : null}
      </CardHeader>
      {upcomingRaces.length === 0 ? null : (
        <CardContent>
          <ul className="flex flex-col">
            {upcomingRaces.slice(0, 5).map((race, index) => (
              <Fragment key={race._id}>
                {index > 0 ? <Separator /> : null}
                <li className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{race.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {race.division ?? getRaceTypeLabel(race.eventType)}
                      {race.location ? ` · ${race.location}` : ""}
                    </p>
                  </div>
                  <Badge
                    className="shrink-0 font-mono text-xs tabular-nums"
                    variant="secondary"
                  >
                    {formatDateRange(race.startDate, race.endDate)}
                  </Badge>
                </li>
              </Fragment>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
