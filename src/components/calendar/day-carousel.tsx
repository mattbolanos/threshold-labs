import * as React from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselToToday,
} from "@/components/ui/carousel";
import { useCalendarNav } from "@/hooks/use-calendar-nav";
import { useDayOfWeek } from "@/hooks/use-day-of-week";
import { cn, getCalendarDays, isSameDay, startOfWeek } from "@/lib/utils";

interface DayCarouselProps {
  maxWorkoutDate: string | undefined;
}

export function DayCarousel({ maxWorkoutDate }: DayCarouselProps) {
  const { setWeekStart, weekStartDate } = useCalendarNav();
  const { dayOfWeek, setDayOfWeek } = useDayOfWeek();

  const calendarDays = React.useMemo(
    () =>
      getCalendarDays(
        maxWorkoutDate ? new Date(`${maxWorkoutDate}T00:00:00`) : new Date(),
      ),
    [maxWorkoutDate],
  );

  const startIndex = React.useMemo(
    () =>
      calendarDays.find((day) => isSameDay(day.date, new Date()))?.weekIndex ??
      0,
    [calendarDays],
  );

  const handleSelectDay = (date: Date) => {
    setWeekStart(startOfWeek(date).toISOString().split("T")[0]);
    setDayOfWeek(date.getDay());
  };

  const currentWeekIndex = React.useMemo(
    () =>
      calendarDays.find((day) => isSameDay(day.date, weekStartDate))
        ?.weekIndex ?? 0,
    [calendarDays, weekStartDate],
  );

  const emblaApiRef = React.useRef<CarouselApi | null>(null);

  const setEmblaApi = React.useCallback((api: CarouselApi | null) => {
    emblaApiRef.current = api;
  }, []);

  const scrollToCurrentWeek = React.useCallback(() => {
    const api = emblaApiRef.current;
    if (!api) return;
    api.scrollTo(currentWeekIndex, true);
  }, [currentWeekIndex]);

  const onSlidesInView = React.useCallback(() => {
    const api = emblaApiRef.current;
    if (!api) return;

    const slides = api.slidesInView();
    const firstSlideIndex = slides[0];
    const day = calendarDays[firstSlideIndex];
    if (day && day.date.getDay() === 0 && day.weekIndex !== currentWeekIndex) {
      const newWeekStart = startOfWeek(day.date).toISOString().split("T")[0];
      setWeekStart(newWeekStart);
    }
  }, [calendarDays, currentWeekIndex, setWeekStart]);

  React.useEffect(() => {
    const api = emblaApiRef.current;
    if (!api) return;

    api.on("init", scrollToCurrentWeek);
    api.on("reInit", scrollToCurrentWeek);
    api.on("slidesInView", onSlidesInView);

    return () => {
      api.off("init", scrollToCurrentWeek);
      api.off("reInit", scrollToCurrentWeek);
      api.off("slidesInView", onSlidesInView);
    };
  }, [scrollToCurrentWeek, onSlidesInView]);

  return (
    <Carousel
      className="relative mx-auto -mt-6 w-full md:hidden"
      opts={{
        dragFree: false,
        slidesToScroll: 7,
        startIndex: currentWeekIndex,
      }}
      setApi={setEmblaApi}
    >
      <ButtonGroup className="ml-auto pb-4">
        <CarouselToToday
          index={startIndex}
          onClick={() => handleSelectDay(new Date())}
        />
      </ButtonGroup>
      <CarouselContent className="ml-0">
        {calendarDays.map(({ date }) => {
          const isSelected = date.getDay() === dayOfWeek;
          const isToday = isSameDay(new Date(), date);

          return (
            <CarouselItem
              className="flex basis-1/7 cursor-pointer flex-col items-center gap-1 pl-0 text-center"
              key={date.toISOString()}
              onClick={() => handleSelectDay(date)}
            >
              {/* Day label */}
              <span className="text-[10px] font-medium">
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
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
