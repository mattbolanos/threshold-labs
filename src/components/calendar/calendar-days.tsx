"use client";

import { DayBlocks } from "./day-blocks";
import { DayCarousel } from "./day-carousel";

export function CalendarDays() {
  return (
    <>
      <DayCarousel />
      <DayBlocks />
    </>
  );
}
