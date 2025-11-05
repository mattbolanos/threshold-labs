"use client";

import { DayButtons } from "./day-buttons";
import { DayCarousel } from "./day-carousel";

export function CalendarDays() {
  return (
    <>
      <DayCarousel />
      <DayButtons />
    </>
  );
}
