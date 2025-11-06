"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useCalendarNav } from "@/hooks/use-calendar-nav";

export function CalendarArrows() {
  const { addWeektoStart, jumpToToday, subtractWeekfromStart } =
    useCalendarNav();

  return (
    <ButtonGroup>
      <ButtonGroup>
        <Button
          aria-label="Go Back"
          className="hidden md:inline-flex"
          onMouseDown={subtractWeekfromStart}
          size="icon-sm"
          variant="ghost"
        >
          <ArrowLeftIcon className="size-5" />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button
          aria-label="Go to Today"
          className="hidden md:inline-flex"
          onMouseDown={jumpToToday}
          size="sm"
          variant="ghost"
        >
          Today
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button
          aria-label="Go Forward"
          className="hidden md:inline-flex"
          onMouseDown={addWeektoStart}
          size="icon-sm"
          variant="ghost"
        >
          <ArrowRightIcon className="size-5" />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  );
}
