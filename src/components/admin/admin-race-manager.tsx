"use client";

import { IconFlag3 } from "@tabler/icons-react";
import { useMutation, useQuery } from "convex/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateRange } from "@/lib/race-dates";
import { getRaceTypeLabel } from "@/lib/races";
import { api } from "../../../convex/_generated/api";
import { DeleteRecordButton } from "./delete-record-button";
import { RaceFormDialog } from "./race-form-dialog";

export function AdminRaceManager() {
  const races = useQuery(api.races.getRacesForAdmin);
  const deleteRace = useMutation(api.races.deleteRace);

  if (races === undefined) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Manual calendar
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Race calendar
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Add any event here, including Elite 15 and local run races.
          </p>
        </div>
        <RaceFormDialog />
      </header>

      {races.length === 0 ? (
        <Empty className="min-h-72 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconFlag3 aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No races added</EmptyTitle>
            <EmptyDescription>
              Add the first event to show it in the Lab Notes sidebar.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card className="py-0">
          <CardContent className="px-0">
            <Table>
              <TableCaption className="sr-only">
                Manually entered races
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Race</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {races.map((race) => (
                  <TableRow key={race._id}>
                    <TableCell className="pl-4 font-medium">
                      <div className="flex flex-col gap-1">
                        <span>{race.name}</span>
                        {race.division ? (
                          <span className="text-muted-foreground text-xs font-normal">
                            {race.division}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">
                      {formatDateRange(race.startDate, race.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getRaceTypeLabel(race.eventType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {race.location ?? "—"}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end gap-1">
                        <RaceFormDialog race={race} />
                        <DeleteRecordButton
                          description="This removes the race from the calendar and the Lab Notes sidebar."
                          label={race.name}
                          onDelete={() => deleteRace({ raceId: race._id })}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
