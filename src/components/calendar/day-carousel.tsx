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
  const [emblaApi, setEmblaApi] = React.useState<CarouselApi>();

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

  React.useEffect(() => {
    if (!emblaApi) return;

    const scrollToCurrentWeek = () => {
      emblaApi.scrollTo(currentWeekIndex, true);
    };

    const onSlidesInView = () => {
      const slides = emblaApi.slidesInView();
      const firstSlideIndex = slides[0];
      const day = calendarDays[firstSlideIndex];

      if (
        day &&
        day.date.getDay() === 0 &&
        day.weekIndex !== currentWeekIndex
      ) {
        const newWeekStart = startOfWeek(day.date).toISOString().split("T")[0];
        setWeekStart(newWeekStart);
      }
    };

    emblaApi.on("init", scrollToCurrentWeek);
    emblaApi.on("reInit", scrollToCurrentWeek);
    emblaApi.on("slidesInView", onSlidesInView);

    return () => {
      emblaApi.off("init", scrollToCurrentWeek);
      emblaApi.off("reInit", scrollToCurrentWeek);
      emblaApi.off("slidesInView", onSlidesInView);
    };
  }, [currentWeekIndex, calendarDays, setWeekStart, emblaApi]);

  return (
    <Carousel
      className="mx-auto -mt-6 w-full md:hidden"
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
