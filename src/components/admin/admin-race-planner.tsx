"use client";

import {
  IconAlertCircle,
  IconCalendarEvent,
  IconRefresh,
} from "@tabler/icons-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRaceDateRange, getTodayDate } from "@/lib/race-dates";
import { api } from "../../../convex/_generated/api";

function RacePlannerSkeleton() {
  return (
    <Card aria-hidden>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
}

export function AdminRacePlanner() {
  const fromDate = getTodayDate();
  const races = useQuery(api.races.getRacesForAdmin, { fromDate });
  const syncRaces = useAction(api.races.syncHyroxLabRaces);
  const setRacePlanned = useMutation(
    api.races.setRacePlanned,
  ).withOptimisticUpdate((store, args) => {
    const currentRaces = store.getQuery(api.races.getRacesForAdmin, {
      fromDate,
    });
    if (!currentRaces) {
      return;
    }
    store.setQuery(
      api.races.getRacesForAdmin,
      { fromDate },
      currentRaces.map((race) =>
        race._id === args.raceId
          ? { ...race, isPlanned: args.isPlanned }
          : race,
      ),
    );
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingRaceIds, setPendingRaceIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshRaces = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsRefreshing(true);
    try {
      const result = await syncRaces({});
      setSuccessMessage(
        `Found ${result.total} races: ${result.added} added and ${result.updated} refreshed.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The HYROX race calendar could not be refreshed.",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateRacePlan = async (
    raceId: NonNullable<typeof races>[number]["_id"],
    isPlanned: boolean,
  ) => {
    setErrorMessage(null);
    setPendingRaceIds((current) => new Set(current).add(raceId));
    try {
      await setRacePlanned({
        isPlanned,
        raceId,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The race selection could not be saved.",
      );
    } finally {
      setPendingRaceIds((current) => {
        const next = new Set(current);
        next.delete(raceId);
        return next;
      });
    }
  };

  if (races === undefined) {
    return <RacePlannerSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>HYROX race planner</CardTitle>
        <CardDescription>
          Refresh the HYROX Lab calendar, then select the races that should
          appear on the homepage.
        </CardDescription>
        <CardAction>
          <Button
            disabled={isRefreshing}
            onClick={() => void refreshRaces()}
            size="sm"
            variant="outline"
          >
            <IconRefresh data-icon="inline-start" />
            {isRefreshing ? "Refreshing…" : "Refresh races"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {errorMessage ? (
          <Alert variant="destructive">
            <IconAlertCircle aria-hidden />
            <AlertTitle>Race planner could not be updated</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
        {successMessage ? (
          <Alert>
            <AlertTitle>Calendar refreshed</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        ) : null}

        {races.length === 0 ? (
          <Empty className="min-h-64 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconCalendarEvent aria-hidden />
              </EmptyMedia>
              <EmptyTitle>No upcoming races synced</EmptyTitle>
              <EmptyDescription>
                Refresh the calendar to import upcoming HYROX races into Convex.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                disabled={isRefreshing}
                onClick={() => void refreshRaces()}
              >
                <IconRefresh data-icon="inline-start" />
                {isRefreshing ? "Refreshing…" : "Refresh races"}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <FieldSet>
            <FieldLegend variant="label">Upcoming races</FieldLegend>
            <FieldDescription>
              {races.filter(({ isPlanned }) => isPlanned).length} of{" "}
              {races.length} races selected. Changes save immediately.
            </FieldDescription>
            <FieldGroup data-slot="checkbox-group">
              {races.map((race) => {
                const checkboxId = `race-${race._id}`;
                const isPending = pendingRaceIds.has(race._id);

                return (
                  <FieldLabel htmlFor={checkboxId} key={race._id}>
                    <Field
                      data-disabled={isPending || undefined}
                      orientation="horizontal"
                    >
                      <Checkbox
                        checked={race.isPlanned}
                        disabled={isPending}
                        id={checkboxId}
                        onCheckedChange={(checked) =>
                          void updateRacePlan(race._id, checked)
                        }
                      />
                      <FieldContent>
                        <FieldTitle>{race.name}</FieldTitle>
                        <FieldDescription>
                          {formatRaceDateRange(race.startDate, race.endDate)} ·{" "}
                          {race.venueName} · {race.locality}, {race.country}
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                );
              })}
            </FieldGroup>
          </FieldSet>
        )}
      </CardContent>
    </Card>
  );
}
