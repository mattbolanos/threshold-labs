"use client";

import { IconCalendarStats } from "@tabler/icons-react";
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
import { formatDateRange, getTodayDate } from "@/lib/race-dates";
import { api } from "../../../convex/_generated/api";
import { DeleteRecordButton } from "./delete-record-button";
import { TrainingBlockFormDialog } from "./training-block-form-dialog";

const getBlockStatus = (startDate: string, endDate: string) => {
  const today = getTodayDate();
  if (startDate > today) return "Upcoming";
  if (endDate < today) return "Complete";
  return "Current";
};

export function AdminTrainingBlockList() {
  const blocks = useQuery(api.trainingBlocks.getTrainingBlocksForAdmin);
  const deleteTrainingBlock = useMutation(
    api.trainingBlocks.deleteTrainingBlock,
  );

  if (blocks === undefined) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Training structure
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Training blocks
          </h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            The active date range automatically becomes the current focus.
          </p>
        </div>
        <TrainingBlockFormDialog />
      </header>

      {blocks.length === 0 ? (
        <Empty className="min-h-72 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconCalendarStats aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No training blocks added</EmptyTitle>
            <EmptyDescription>
              Add a dated block to show the current focus beside Lab Notes.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card className="py-0">
          <CardContent className="px-0">
            <Table>
              <TableCaption className="sr-only">Training blocks</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Block</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((block) => {
                  const status = getBlockStatus(block.startDate, block.endDate);
                  return (
                    <TableRow key={block._id}>
                      <TableCell className="max-w-md pl-4">
                        <div className="flex flex-col gap-1 whitespace-normal">
                          <span className="font-medium">{block.title}</span>
                          <span className="text-muted-foreground line-clamp-2 text-xs">
                            {block.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">
                        {formatDateRange(block.startDate, block.endDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "Current" ? "default" : "secondary"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex justify-end gap-1">
                          <TrainingBlockFormDialog block={block} />
                          <DeleteRecordButton
                            description="This removes the block and its current-focus context from Lab Notes."
                            label={block.title}
                            onDelete={() =>
                              deleteTrainingBlock({ blockId: block._id })
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
