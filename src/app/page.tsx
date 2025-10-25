import { CalendarArrows } from "@/components/calendar-arrows";
import { CalendarWeek } from "@/components/calendar-week";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <CalendarArrows />
      <CalendarWeek />
    </div>
  );
}
