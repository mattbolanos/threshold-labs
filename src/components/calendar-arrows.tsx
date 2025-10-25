"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useWeekStart } from "@/hooks/use-week-start";
import { addWeeks, formatWeekRangeLabel, startOfWeek } from "@/lib/utils";

export function CalendarArrows() {
  const today = new Date();
  const { weekStart, setWeekStart } = useWeekStart();

  const headerLabel = useMemo(
    () => formatWeekRangeLabel(weekStart),
    [weekStart],
  );

  const handleGoBack = () => {
    setWeekStart((prev) => addWeeks(prev, -1));
  };

  const handleGoForward = () => {
    setWeekStart((prev) => addWeeks(prev, 1));
  };

  const handleGoToday = () => {
    setWeekStart(startOfWeek(today));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="flex items-center gap-1 text-sm font-medium tabular-nums">
          {headerLabel} • Cycle 18
        </span>
        <ButtonGroup>
          <ButtonGroup>
            <Button
              aria-label="Go Back"
              onClick={handleGoBack}
              size="icon-sm"
              variant="ghost"
            >
              <ArrowLeftIcon className="size-5" />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button
              aria-label="Go to Today"
              onClick={handleGoToday}
              size="sm"
              variant="ghost"
            >
              Today
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button
              aria-label="Go Forward"
              onClick={handleGoForward}
              size="icon-sm"
              variant="ghost"
            >
              <ArrowRightIcon className="size-5" />
            </Button>
          </ButtonGroup>
        </ButtonGroup>
      </div>
    </div>
  );
}
