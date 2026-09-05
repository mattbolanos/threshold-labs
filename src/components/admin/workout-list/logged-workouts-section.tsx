import { IconSearch } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";
import {
  FILTER_OPTIONS,
  type FilterValue,
  type Workout,
} from "@/components/admin/workout-form-utils";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { WorkoutResults } from "./workout-results";

type LoggedWorkoutsSectionProps = {
  filteredWorkouts: Workout[];
  filterValue: FilterValue;
  onFilterChange: (nextFilter: FilterValue) => void;
  onSearchChange: (nextSearch: string) => void;
  onToggleVisibility: (workout: Workout) => void;
  pendingVisibilityId: string | null;
  searchQuery: string;
  workouts: Workout[] | undefined;
  workoutTable: Table<Workout>;
};

export function LoggedWorkoutsSection({
  filteredWorkouts,
  filterValue,
  onFilterChange,
  onSearchChange,
  onToggleVisibility,
  pendingVisibilityId,
  searchQuery,
  workouts,
  workoutTable,
}: LoggedWorkoutsSectionProps) {
  return (
    <section
      aria-labelledby="logged-workouts-heading"
      className="flex flex-col gap-5"
    >
      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Workouts
          </p>
          <h2
            className="text-xl font-semibold tracking-tight"
            id="logged-workouts-heading"
          >
            Logged Workouts
          </h2>
        </div>
        <ButtonGroup
          aria-label="Workout visibility"
          className="w-full sm:w-fit"
        >
          {FILTER_OPTIONS.map((option) => (
            <Button
              className="min-h-9 flex-1 sm:flex-none"
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              size="sm"
              variant={filterValue === option.value ? "default" : "outline"}
            >
              {option.label}
            </Button>
          ))}
        </ButtonGroup>
      </header>

      <div className="flex flex-col gap-3">
        <div className="relative w-full sm:max-w-sm">
          <IconSearch
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2"
          />
          <Input
            aria-label="Search workouts"
            className="min-h-11 ps-9"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by title, tag, week..."
            type="search"
            value={searchQuery}
          />
        </div>

        {workouts === undefined ? (
          <div className="text-muted-foreground py-6 text-sm">
            Loading workouts...
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <Empty className="bg-muted/30 border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconSearch />
              </EmptyMedia>
            </EmptyHeader>
            <EmptyTitle>
              {searchQuery.trim()
                ? "No workouts match your search."
                : "No workouts found for this filter."}
            </EmptyTitle>
          </Empty>
        ) : (
          <WorkoutResults
            filteredWorkouts={filteredWorkouts}
            onToggleVisibility={onToggleVisibility}
            pendingVisibilityId={pendingVisibilityId}
            workoutTable={workoutTable}
          />
        )}
      </div>
    </section>
  );
}
