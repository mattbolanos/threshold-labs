import { useCalendarNav } from "@/hooks/use-calendar-nav";

interface DayCarouselProps {
  maxWorkoutDate: string | undefined;
}

export function DayCarousel({ maxWorkoutDate }: DayCarouselProps) {
  const { setWeekStart, weekStartDate } = useCalendarNav();

  return <div className="md:hidden"></div>;
}
