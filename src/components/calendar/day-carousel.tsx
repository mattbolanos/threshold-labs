import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselToToday,
} from "@/components/ui/carousel";
import { useCalendar } from "@/hooks/use-calendar";
import { cn, getCalendarDays, isSameDay, startOfWeek } from "@/lib/utils";
import { ButtonGroup } from "../ui/button-group";

export function DayCarousel() {
  const { selectedDayDate, setSelectedDay, setWeekStart } = useCalendar();

  const calendarDays = getCalendarDays(new Date());
  const startIndex = calendarDays.days.find((day) =>
    isSameDay(day.date, new Date()),
  )?.weekIndex;

  const handleSelectDay = (date: Date) => {
    setSelectedDay(date.toISOString().split("T")[0]);
    setWeekStart(startOfWeek(date).toISOString().split("T")[0]);
  };

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
      <CarouselContent>
        {calendarDays.days.map(({ date }) => {
          const isSelected = isSameDay(selectedDayDate, date);

          return (
            <CarouselItem className="basis-1/7" key={date.toISOString()}>
              <button
                className="bg-card flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full font-medium"
                key={date.toISOString()}
                onClick={() => handleSelectDay(date)}
                type="button"
              >
                <span className="text-[10px] opacity-70">
                  {date.toLocaleString("default", {
                    weekday: "narrow",
                  })}
                </span>
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-sm tabular-nums",
                    isSelected ? "bg-primary text-primary-foreground" : "",
                  )}
                >
                  {date.getDate()}
                </span>
              </button>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
