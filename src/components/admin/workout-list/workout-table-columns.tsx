import { IconLoader2 } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { Workout } from "@/components/admin/workout-form-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/workouts/tag-badge";
import { formatWorkoutDate } from "@/lib/utils";

export function getWorkoutColumns({
  onToggleVisibility,
  pendingVisibilityId,
}: {
  onToggleVisibility: (workout: Workout) => void;
  pendingVisibilityId: string | null;
}): ColumnDef<Workout>[] {
  return [
    {
      accessorKey: "workoutDate",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatWorkoutDate(new Date(row.original.workoutDate))}
        </span>
      ),
      header: "Date",
    },
    {
      accessorKey: "title",
      cell: ({ row }) => (
        <div className="min-w-40 space-y-1">
          <p className="font-medium">{row.original.title}</p>
          <div className="flex flex-wrap items-center gap-1">
            {row.original.tags.map((tag) => (
              <TagBadge className="text-[11px]" key={tag} tag={tag} />
            ))}
          </div>
        </div>
      ),
      header: "Title",
    },
    {
      accessorKey: "week",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{row.original.week}</span>
      ),
      header: "Week",
    },
    {
      accessorKey: "rpe",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">RPE {row.original.rpe}</span>
      ),
      header: "RPE",
    },
    {
      accessorKey: "trainingMinutes",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {row.original.trainingMinutes} min
        </span>
      ),
      header: "Training mins",
    },
    {
      accessorKey: "isHidden",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          <Badge variant={row.original.isHidden ? "destructive" : "default"}>
            {row.original.isHidden ? "Hidden" : "Visible"}
          </Badge>
        </span>
      ),
      header: "Visibility",
    },
    {
      accessorKey: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button asChild className="min-h-9" size="sm" variant="outline">
            <Link href={`/admin/workout/${row.original._id}`}>Edit</Link>
          </Button>
          <Button
            className="min-h-9"
            disabled={pendingVisibilityId === row.original._id}
            onClick={() => onToggleVisibility(row.original)}
            size="sm"
            type="button"
            variant="outline"
          >
            {pendingVisibilityId === row.original._id ? (
              <>
                <IconLoader2 aria-hidden className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : row.original.isHidden ? (
              "Show"
            ) : (
              "Hide"
            )}
          </Button>
        </div>
      ),
      header: "Actions",
    },
  ];
}
