const LAB_TIME_ZONE = "America/New_York";
const WORKOUT_HISTORY_DAYS = 30;
const QUERY_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const TRAINING_ARCHIVE_ACCESS_WINDOW = {
  from: "2025-09-01",
  to: "2026-09-01",
} as const;

const labDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  timeZone: LAB_TIME_ZONE,
  year: "numeric",
});

export interface WorkoutAccessWindow {
  from: string;
  to: string;
}

interface ChartDateRangeDefaults {
  from: string;
  to?: string;
}

function formatLabDate(date: Date) {
  const parts = Object.fromEntries(
    labDateFormatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function subtractCalendarDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day - days));

  return result.toISOString().slice(0, 10);
}

function isValidQueryDate(value: string) {
  if (!QUERY_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return parsed.toISOString().slice(0, 10) === value;
}

export function getWorkoutAccessWindow(
  now: Date = new Date(),
): WorkoutAccessWindow {
  const to = formatLabDate(now);

  return {
    from: subtractCalendarDays(to, WORKOUT_HISTORY_DAYS),
    to,
  };
}

export function hasUnrestrictedWorkoutAccess(accessSource: string) {
  return accessSource === "admin" || accessSource === "preview";
}

export function getWorkoutListingAccessWindows(
  accessSource: string,
  hasTrainingArchive: boolean,
  now: Date = new Date(),
): WorkoutAccessWindow[] | null {
  if (hasUnrestrictedWorkoutAccess(accessSource)) {
    return null;
  }

  const accessWindows: WorkoutAccessWindow[] = [];

  if (accessSource === "subscription") {
    accessWindows.push(getWorkoutAccessWindow(now));
  }

  if (accessSource === "training_archive" || hasTrainingArchive) {
    accessWindows.push(TRAINING_ARCHIVE_ACCESS_WINDOW);
  }

  return accessWindows;
}

export function getChartWorkoutDateRange(
  accessSource: string,
  from: string | undefined,
  to: string | undefined,
  defaults: ChartDateRangeDefaults,
) {
  if (accessSource !== "training_archive") {
    return {
      from: from ?? defaults.from,
      to: to ?? defaults.to,
    };
  }

  return getAccessibleWorkoutDateRange(
    from ?? TRAINING_ARCHIVE_ACCESS_WINDOW.from,
    to ?? TRAINING_ARCHIVE_ACCESS_WINDOW.to,
    TRAINING_ARCHIVE_ACCESS_WINDOW,
  );
}

export function getAccessibleWorkoutDateRange(
  from: string,
  to: string,
  accessWindow: WorkoutAccessWindow | null,
): WorkoutAccessWindow | null {
  if (!isValidQueryDate(from) || !isValidQueryDate(to) || from > to) {
    return null;
  }

  if (!accessWindow) {
    return { from, to };
  }

  const boundedRange = {
    from: from < accessWindow.from ? accessWindow.from : from,
    to: to > accessWindow.to ? accessWindow.to : to,
  };

  return boundedRange.from <= boundedRange.to ? boundedRange : null;
}

export function getAccessibleWorkoutDateRanges(
  from: string,
  to: string,
  accessWindows: WorkoutAccessWindow[] | null,
) {
  if (!isValidQueryDate(from) || !isValidQueryDate(to) || from > to) {
    return [];
  }

  if (!accessWindows) {
    return [{ from, to }];
  }

  return accessWindows.flatMap((accessWindow) => {
    const range = getAccessibleWorkoutDateRange(from, to, accessWindow);
    return range ? [range] : [];
  });
}

export function isWorkoutDateInAccessWindow(
  workoutDate: string,
  accessWindow: WorkoutAccessWindow,
) {
  return (
    isValidQueryDate(workoutDate) &&
    workoutDate >= accessWindow.from &&
    workoutDate <= accessWindow.to
  );
}

export function isWorkoutDateInAccessWindows(
  workoutDate: string,
  accessWindows: WorkoutAccessWindow[] | null,
) {
  return (
    accessWindows === null ||
    accessWindows.some((accessWindow) =>
      isWorkoutDateInAccessWindow(workoutDate, accessWindow),
    )
  );
}
