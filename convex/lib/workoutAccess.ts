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
  purchasedBlockWindows?: WorkoutAccessWindow[] | null;
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
    purchasedBlockWindows,
  }: WorkoutEntitlements,
  now: Date = new Date(),
): WorkoutAccessWindow[] | null {
  if (hasUnrestrictedWorkoutAccess(accessSource)) {
    return null;
  }

  const accessWindows: WorkoutAccessWindow[] = [
    ...(purchasedBlockWindows ?? []),
  ];

  if (accessSource === "subscription") {
    const currentWindow = getWorkoutAccessWindow(now);
    accessWindows.push(...(pastMembershipWindows ?? []), {
      from: membershipAccessStart ?? currentWindow.from,
      to: currentWindow.to,
    });
  }

  return mergeWorkoutAccessWindows(accessWindows);
}

/**
 * The calendar can only navigate to weeks the viewer is entitled to see.
 * Unrestricted viewers can reach every published workout plus the current
 * week; everyone else is bounded by their merged access windows, so a viewer
 * whose only purchase is a past training block stays inside that block.
 */
export function getTrainingCalendarRange(
  accessWindows: WorkoutAccessWindow[] | null,
  publishedWorkoutRange: { from: string; to: string } | null,
  now: Date = new Date(),
): { from: string | null; to: string } {
  if (accessWindows === null) {
    const today = formatLabDate(now);

    return {
      from: publishedWorkoutRange?.from ?? null,
      to:
        publishedWorkoutRange && publishedWorkoutRange.to > today
          ? publishedWorkoutRange.to
          : today,
    };
  }

  const firstWindow = accessWindows[0];
  const lastWindow = accessWindows.at(-1);

  if (!firstWindow || !lastWindow) {
    return { from: null, to: formatLabDate(now) };
  }

  return { from: firstWindow.from, to: lastWindow.to };
}

/**
 * Charts are a high-level overview and always cover every published workout,
 * regardless of which blocks or membership windows the viewer owns. Only the
 * workout library itself is restricted to the viewer's entitlements.
 */
export function getChartWorkoutDateRange(
  from: string | undefined,
  to: string | undefined,
  defaults: ChartDateRangeDefaults,
  now: Date = new Date(),
) {
  return getAccessibleWorkoutDateRange(
    from ?? defaults.from,
    to ?? defaults.to ?? formatLabDate(now),
    null,
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
