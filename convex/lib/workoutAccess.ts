const LAB_TIME_ZONE = "America/New_York";
const WORKOUT_HISTORY_DAYS = 30;
const QUERY_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const TRAINING_HISTORY_START_DATE = "2025-09-01";

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

export interface WorkoutEntitlements {
  accessSource: string;
  membershipAccessStart?: string | null;
  pastMembershipWindows?: WorkoutAccessWindow[] | null;
  trainingArchive?: WorkoutAccessWindow | null;
}

export function formatLabDate(date: Date) {
  const parts = Object.fromEntries(
    labDateFormatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function subtractCalendarDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day - days));

  return result.toISOString().slice(0, 10);
}

function subtractCalendarMonth(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const lastDayOfPreviousMonth = new Date(Date.UTC(year, month - 1, 0));
  const result = new Date(
    Date.UTC(
      lastDayOfPreviousMonth.getUTCFullYear(),
      lastDayOfPreviousMonth.getUTCMonth(),
      Math.min(day, lastDayOfPreviousMonth.getUTCDate()),
    ),
  );

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

export function getMembershipAccessStart(startedAt: number) {
  return subtractCalendarMonth(formatLabDate(new Date(startedAt)));
}

export function getMembershipAccessEnd(
  endedAt: number,
  periodEnd?: number | null,
) {
  return formatLabDate(
    new Date(periodEnd && periodEnd < endedAt ? periodEnd : endedAt),
  );
}

export function mergeWorkoutAccessWindows(windows: WorkoutAccessWindow[]) {
  const sortedWindows = windows
    .filter((window) => window.from <= window.to)
    .toSorted((left, right) => left.from.localeCompare(right.from));

  return sortedWindows.reduce<WorkoutAccessWindow[]>((merged, window) => {
    const previous = merged.at(-1);

    if (previous && window.from <= previous.to) {
      previous.to = window.to > previous.to ? window.to : previous.to;
    } else {
      merged.push({ ...window });
    }

    return merged;
  }, []);
}

export function hasUnrestrictedWorkoutAccess(accessSource: string) {
  return accessSource === "admin" || accessSource === "preview";
}

export function getWorkoutListingAccessWindows(
  {
    accessSource,
    membershipAccessStart,
    pastMembershipWindows,
    trainingArchive,
  }: WorkoutEntitlements,
  now: Date = new Date(),
): WorkoutAccessWindow[] | null {
  if (hasUnrestrictedWorkoutAccess(accessSource)) {
    return null;
  }

  const accessWindows: WorkoutAccessWindow[] = [];

  if (accessSource === "subscription") {
    const currentWindow = getWorkoutAccessWindow(now);
    accessWindows.push(
      ...mergeWorkoutAccessWindows([
        ...(pastMembershipWindows ?? []),
        {
          from: membershipAccessStart ?? currentWindow.from,
          to: currentWindow.to,
        },
      ]),
    );
  }

  if (trainingArchive) {
    accessWindows.push(trainingArchive);
  }

  return accessWindows;
}

export function getChartWorkoutDateRanges(
  entitlements: WorkoutEntitlements,
  from: string | undefined,
  to: string | undefined,
  defaults: ChartDateRangeDefaults,
  now: Date = new Date(),
) {
  const archiveOnly =
    entitlements.accessSource === "training_archive"
      ? entitlements.trainingArchive
      : null;

  return getAccessibleWorkoutDateRanges(
    from ?? archiveOnly?.from ?? defaults.from,
    to ?? archiveOnly?.to ?? defaults.to ?? formatLabDate(now),
    getWorkoutListingAccessWindows(entitlements, now),
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
