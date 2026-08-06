import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DayStatus, getCalendarDayStatus } from "./day-status";

describe("getCalendarDayStatus", () => {
  test("distinguishes rest, unlogged, planned, and logged days", () => {
    const today = "2026-08-05";

    expect(
      getCalendarDayStatus({
        day: "2026-08-04",
        hasWorkouts: false,
        today,
      }),
    ).toBe("rest");
    expect(
      getCalendarDayStatus({
        day: today,
        hasWorkouts: false,
        today,
      }),
    ).toBe("not-logged");
    expect(
      getCalendarDayStatus({
        day: "2026-08-06",
        hasWorkouts: true,
        today,
      }),
    ).toBe("planned");
    expect(
      getCalendarDayStatus({
        day: today,
        hasWorkouts: true,
        today,
      }),
    ).toBe("logged");
  });

  test("leaves an empty future day unlabelled", () => {
    expect(
      getCalendarDayStatus({
        day: "2026-08-06",
        hasWorkouts: false,
        today: "2026-08-05",
      }),
    ).toBe("empty");
  });
});

test("renders a clear text label for each visible status", () => {
  const markup = ["rest", "not-logged", "planned"]
    .map((status) =>
      renderToStaticMarkup(
        <DayStatus status={status as "rest" | "not-logged" | "planned"} />,
      ),
    )
    .join("");

  expect(markup).toContain("Rest day");
  expect(markup).toContain("Not logged yet");
  expect(markup).toContain("Planned");
});
