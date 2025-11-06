import * as React from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselToToday,
} from "@/components/ui/carousel";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { useDayOfWeek } from "@/hooks/use-day-of-week";
import { cn, getCalendarDays, isSameDay, startOfWeek } from "@/lib/utils";

export function DayCarousel() {
  const { setWeekStart } = useCalendarNav();
  const { dayOfWeek, setDayOfWeek } = useDayOfWeek();

  const calendarDays = getCalendarDays(new Date());
  const startIndex = calendarDays.days.find((day) =>
    isSameDay(day.date, new Date()),
  )?.weekIndex;

  const handleSelectDay = React.useCallback(
    (date: Date) => {
      setWeekStart(startOfWeek(date).toISOString().split("T")[0]);
      setDayOfWeek(date.getDay());
    },
    [setWeekStart, setDayOfWeek],
  );

  return (
    <Carousel
      className="mx-auto -mt-6 w-full md:hidden"
      opts={{
        slidesToScroll: 7,
        startIndex,
      }}
    >
      <ButtonGroup className="ml-auto pb-4">
        <CarouselToToday
          index={startIndex ?? 0}
          onClick={() => handleSelectDay(new Date())}
        />
      </ButtonGroup>
      <CarouselContent className="ml-0">
        {calendarDays.days.map(({ date }) => {
          const isSelected = date.getDay() === dayOfWeek;
          const isToday = isSameDay(new Date(), date);

          return (
            <CarouselItem className="basis-1/7" key={date.toISOString()}>
              <button
                className="flex cursor-pointer flex-col items-center gap-1 text-center"
                onClick={() => handleSelectDay(date)}
                type="button"
              >
                {/* Day label */}
                <span className="text-muted-foreground text-[10px] font-medium">
                  {date.toLocaleString("default", {
                    weekday: "narrow",
                  })}
                </span>
                <div className="relative">
                  {isToday && isSelected && (
                    <div className="bg-primary absolute inset-0 rounded-full"></div>
                  )}
                  {isSelected && !isToday && (
                    <div className="bg-foreground absolute inset-0 rounded-full"></div>
                  )}
                  <div
                    className={cn(
                      "text-foreground relative flex size-6.5 items-center justify-center rounded-full text-xs font-semibold",
                      isSelected && isToday ? "text-primary-foreground" : "",
                      isToday && !isSelected ? "text-primary" : "",
                      isSelected && !isToday ? "text-background" : "",
                    )}
                  >
                    {date.getDate()}
                  </div>
                </div>
              </button>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
