"use client";

import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TAG_CONFIG } from "@/components/workouts/tag-config";
import type { WorkoutLibraryFilters } from "@/lib/workout-library";
import { WorkoutDateFilter } from "./workout-date-filter";

interface TrainingBlockOption {
  id: string;
  title: string;
}

interface WorkoutLibraryFiltersProps {
  filters: WorkoutLibraryFilters;
  hasNoBlockWorkouts: boolean;
  onChange: (value: Partial<WorkoutLibraryFilters>) => void;
  onReset: () => void;
  trainingBlocks: TrainingBlockOption[];
}

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
];

export function WorkoutLibraryFiltersView({
  filters,
  hasNoBlockWorkouts,
  onChange,
  onReset,
  trainingBlocks,
}: WorkoutLibraryFiltersProps) {
  const tagIdPrefix = useId();
  const trainingBlockOptions = [
    { label: "All blocks", value: "all" },
    ...(hasNoBlockWorkouts
      ? [{ label: "No training block", value: "none" }]
      : []),
    ...trainingBlocks.map((block) => ({
      label: block.title,
      value: block.id,
    })),
  ];

  const toggleTag = (tag: string, checked: boolean) => {
    onChange({
      tags: checked
        ? [...filters.tags, tag]
        : filters.tags.filter((selectedTag) => selectedTag !== tag),
    });
  };

  return (
    <section
      aria-label="Workout filters"
      className="rounded-xl border bg-card p-4 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="flex min-w-0 flex-col gap-2 xl:col-span-2">
          <Label htmlFor="workout-library-search">Search workouts</Label>
          <div className="relative">
            <IconSearch
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              autoComplete="off"
              className="pl-8"
              id="workout-library-search"
              name="workout-search"
              onChange={(event) => onChange({ q: event.target.value })}
              placeholder="Try hills, strength, or a block name"
              type="search"
              value={filters.q}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor="workout-library-date">Date</Label>
          <WorkoutDateFilter
            dateMode={filters.dateMode}
            from={filters.from}
            id="workout-library-date"
            onChange={onChange}
            to={filters.to}
            week={filters.week}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor="workout-library-block">Training block</Label>
          <Select
            items={trainingBlockOptions}
            onValueChange={(value) => onChange({ block: value ?? "all" })}
            value={filters.block}
          >
            <SelectTrigger className="w-full" id="workout-library-block">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                <SelectItem value="all">All blocks</SelectItem>
                {hasNoBlockWorkouts ? (
                  <SelectItem value="none">No training block</SelectItem>
                ) : null}
                {trainingBlocks.map((block) => (
                  <SelectItem key={block.id} value={block.id}>
                    {block.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor="workout-library-types">Workout type</Label>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  className="w-full justify-start overflow-hidden font-normal"
                  id="workout-library-types"
                  type="button"
                  variant="outline"
                />
              }
            >
              <IconAdjustmentsHorizontal aria-hidden data-icon="inline-start" />
              <span className="truncate">
                {filters.tags.length > 0
                  ? `${filters.tags.length} selected`
                  : "All types"}
              </span>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-3">
              <PopoverHeader>
                <PopoverTitle>Workout types</PopoverTitle>
                <PopoverDescription>
                  Match workouts with any selected type.
                </PopoverDescription>
              </PopoverHeader>
              <div className="flex max-h-72 flex-col gap-1 overflow-y-auto py-1">
                {TAG_CONFIG.map(({ icon: Icon, tag }) => {
                  const id = `${tagIdPrefix}-${tag.replaceAll(" ", "-")}`;
                  return (
                    <div
                      className="flex min-h-9 items-center gap-3 rounded-md px-2 hover:bg-muted"
                      key={tag}
                    >
                      <Checkbox
                        checked={filters.tags.includes(tag)}
                        id={id}
                        onCheckedChange={(checked) =>
                          toggleTag(tag, checked === true)
                        }
                      />
                      <Label
                        className="min-w-0 flex-1 cursor-pointer font-normal"
                        htmlFor={id}
                      >
                        <Icon aria-hidden className="size-4 shrink-0" />
                        <span className="truncate">{tag}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
              {filters.tags.length > 0 ? (
                <Button
                  className="self-start"
                  onClick={() => onChange({ tags: [] })}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Clear workout types
                </Button>
              ) : null}
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor="workout-library-sort">Sort</Label>
          <Select
            items={sortOptions}
            onValueChange={(value) =>
              onChange({ sort: value === "oldest" ? "oldest" : "newest" })
            }
            value={filters.sort}
          >
            <SelectTrigger className="w-full" id="workout-library-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <Button onClick={onReset} type="button" variant="destructive">
          Reset filters
        </Button>
      </div>
    </section>
  );
}
