"use client";

import { IconCalendarEvent, IconMapPin } from "@tabler/icons-react";
import { useQuery } from "convex/react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRaceDateRange, getTodayDate } from "@/lib/race-dates";
import { api } from "../../../convex/_generated/api";

function PlannedRacesSkeleton() {
  return (
    <section aria-hidden className="flex flex-col gap-4">
      <Skeleton className="h-7 w-44" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
    </section>
  );
}

export function PlannedRaces() {
  const races = useQuery(api.races.getPlannedRaces, {
    fromDate: getTodayDate(),
  });

  if (races === undefined) {
    return <PlannedRacesSkeleton />;
  }
  if (races.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="planned-races" className="flex flex-col gap-4">
      <header>
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          Next up
        </p>
        <h2
          className="text-2xl font-semibold tracking-tight"
          id="planned-races"
        >
          Races on the calendar
        </h2>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {races.map((race) => (
          <Card key={race._id}>
            <CardHeader>
              <CardTitle>{race.name}</CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <IconMapPin aria-hidden />
                <span>
                  {race.locality}, {race.country}
                </span>
              </CardDescription>
              <CardAction>
                <Badge variant="secondary">Planned</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <IconCalendarEvent aria-hidden />
              <span className="font-medium">
                {formatRaceDateRange(race.startDate, race.endDate)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
