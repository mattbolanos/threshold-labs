import { CalendarBlock } from "@/components/calendar-block";

export default function Home() {
  return (
    <div className="grid grid-cols-5 gap-3">
      {Array.from({ length: 5 }).map((_, colIndex) => (
        <div className="flex flex-col gap-2" key={colIndex}>
          {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(
            (_, rowIndex) => (
              <CalendarBlock key={`${colIndex}-${rowIndex}`} />
            ),
          )}
        </div>
      ))}
    </div>
  );
}
