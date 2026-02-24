"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "convex/react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useChartState } from "@/hooks/use-chart-state";
import { cn, formatWorkoutDate } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";

type WeeklyTotal = {
  week: string;
  trainingMinutes: number;
  cardioMinutes: number;
  stl: number;
  totalRunMiles: number;
  totalBikeMiles: number;
  totalRowKs: number;
  totalSkiKs: number;
  easyMiles: number;
  lt1Miles: number;
  lt2Miles: number;
  vo2Miles: number;
  speedMiles: number;
  burpees: number;
  wallballs: number;
};

interface ColumnGroup {
  label: string;
  columns: {
    key: keyof WeeklyTotal;
    label: string;
    format: (value: number) => string;
  }[];
}

const COLUMN_GROUPS: ColumnGroup[] = [
  {
    columns: [
      {
        format: (v) => (v / 60).toFixed(1),
        key: "trainingMinutes",
        label: "Training Hrs",
      },
      {
        format: (v) => (v / 60).toFixed(1),
        key: "cardioMinutes",
        label: "Cardio Hrs",
      },
      {
        format: (v) => v.toFixed(1),
        key: "stl",
        label: "Subj. Load",
      },
    ],
    label: "Overview",
  },
  {
    columns: [
      {
        format: (v) => v.toFixed(1),
        key: "totalRunMiles",
        label: "Run Mi",
      },
      {
        format: (v) => v.toFixed(1),
        key: "totalBikeMiles",
        label: "Bike Mi",
      },
      {
        format: (v) => v.toFixed(1),
        key: "totalRowKs",
        label: "Row Km",
      },
      {
        format: (v) => v.toFixed(1),
        key: "totalSkiKs",
        label: "Ski Km",
      },
    ],
    label: "Activity",
  },
  {
    columns: [
      {
        format: (v) => v.toFixed(1),
        key: "easyMiles",
        label: "Easy",
      },
      {
        format: (v) => v.toFixed(1),
        key: "lt1Miles",
        label: "LT1",
      },
      {
        format: (v) => v.toFixed(1),
        key: "lt2Miles",
        label: "LT2",
      },
      {
        format: (v) => v.toFixed(1),
        key: "vo2Miles",
        label: "VO2",
      },
      {
        format: (v) => v.toFixed(1),
        key: "speedMiles",
        label: "Speed",
      },
    ],
    label: "Run Mix",
  },
  {
    columns: [
      {
        format: (v) => v.toFixed(0),
        key: "burpees",
        label: "Burpees",
      },
      {
        format: (v) => v.toFixed(0),
        key: "wallballs",
        label: "Wallballs",
      },
    ],
    label: "Functional",
  },
];

function isGroupStart(key: string) {
  return COLUMN_GROUPS.some((g) => g.columns[0].key === key);
}

function SortIcon({
  column,
}: {
  column: { getIsSorted: () => false | "asc" | "desc" };
}) {
  const sorted = column.getIsSorted();
  if (sorted === "asc") return <ArrowUp className="ml-1 inline h-3 w-3" />;
  if (sorted === "desc") return <ArrowDown className="ml-1 inline h-3 w-3" />;
  return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />;
}

function buildColumns(): ColumnDef<WeeklyTotal>[] {
  const weekCol: ColumnDef<WeeklyTotal> = {
    accessorKey: "week",
    cell: ({ getValue }) => (
      <span className="px-1.5 font-medium tabular-nums">
        {formatWorkoutDate(new Date(getValue<string>()))}
      </span>
    ),
    header: ({ column }) => (
      <Button
        className="mr-0 flex items-center font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        size="sm"
        type="button"
        variant="ghost"
      >
        Week
        <SortIcon column={column} />
      </Button>
    ),
    meta: { sticky: true },
  };

  const dataCols: ColumnDef<WeeklyTotal>[] = COLUMN_GROUPS.flatMap((group) =>
    group.columns.map(
      (col): ColumnDef<WeeklyTotal> => ({
        accessorKey: col.key,
        cell: ({ getValue }) => {
          const value = getValue<number>();
          if (value === 0) {
            return <span className="text-muted-foreground/40">&mdash;</span>;
          }
          return col.format(value);
        },
        header: ({ column }) => (
          <Button
            className="px-1.5!"
            disabled={!column.getCanSort()}
            onClick={column.getToggleSortingHandler()}
            size="sm"
            type="button"
            variant="ghost"
          >
            {col.label}
            <SortIcon column={column} />
          </Button>
        ),
        meta: { groupStart: isGroupStart(col.key) },
      }),
    ),
  );

  return [weekCol, ...dataCols];
}

function TableSkeleton() {
  return (
    <div className="flex w-full flex-col gap-3 p-4">
      <div className="flex gap-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <skeleton>
        <Skeleton className="h-10 w-full" key={i} />
      ))}
    </div>
  );
}

export function TotalsTable() {
  const { range } = useChartState();

  const data = useQuery(api.workouts.getWeeklyTotals, {
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
  });

  const columns = useMemo(() => buildColumns(), []);

  const table = useReactTable({
    columns,
    data: data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ desc: true, id: "week" }],
    },
  });

  if (data === undefined) {
    return <TableSkeleton />;
  }

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
        No workout data for the selected range.
      </div>
    );
  }

  const headerGroups = table.getHeaderGroups();
  const weekHeader = headerGroups[0].headers.find(
    (h) => h.column.id === "week",
  );

  return (
    <Table>
      <TableHeader>
        {/* Group header row */}
        <TableRow className="border-b-0">
          <TableHead
            className="bg-background sticky left-0 z-10 border-b"
            rowSpan={2}
          >
            {weekHeader &&
              flexRender(
                weekHeader.column.columnDef.header,
                weekHeader.getContext(),
              )}
          </TableHead>
          {COLUMN_GROUPS.map((group) => (
            <TableHead
              className="border-b border-l text-center"
              colSpan={group.columns.length}
              key={group.label}
            >
              <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.1em] uppercase">
                {group.label}
              </span>
            </TableHead>
          ))}
        </TableRow>
        {/* Sortable column headers */}
        <TableRow>
          {headerGroups[0].headers.map((header) => {
            const meta = header.column.columnDef.meta as
              | { sticky?: boolean; groupStart?: boolean }
              | undefined;
            if (meta?.sticky) {
              // Week column — already rendered as rowSpan={2} above, but we
              // need the sort button. We render it inside the rowSpan cell
              // using a portal-like approach. Instead, let's just skip it here
              // and put the sort button in the rowSpan cell above.
              return null;
            }
            return (
              <TableHead
                className={cn(
                  "text-right text-xs",
                  meta?.groupStart && "border-l",
                )}
                key={header.id}
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => {
              const meta = cell.column.columnDef.meta as
                | { sticky?: boolean; groupStart?: boolean }
                | undefined;
              return (
                <TableCell
                  className={cn(
                    meta?.sticky
                      ? "bg-background sticky left-0 z-10 font-medium"
                      : "text-right tabular-nums",
                    meta?.groupStart && "border-l",
                  )}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
