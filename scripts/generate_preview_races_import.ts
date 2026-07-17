import {
  addDays,
  getNextWeekday,
  parseIsoDate,
  parsePreviewSeedArgs,
  toIsoDate,
  writePreviewJsonl,
} from "./preview_seed_utils";

type RaceDoc = {
  createdAt: number;
  division?: string;
  endDate: string;
  eventType: "hyrox" | "run" | "other";
  location?: string;
  name: string;
  startDate: string;
  updatedAt: number;
};

type RaceTemplate = Omit<
  RaceDoc,
  "createdAt" | "endDate" | "startDate" | "updatedAt"
> & {
  durationDays?: number;
  weekOffset: number;
};

const DEFAULT_OUTPUT = ".generated/convex-preview-races.jsonl";

const RACE_TEMPLATES: RaceTemplate[] = [
  {
    division: "Pro Doubles",
    durationDays: 1,
    eventType: "hyrox",
    location: "Chicago, IL",
    name: "HYROX Chicago",
    weekOffset: -27,
  },
  {
    eventType: "run",
    location: "Philadelphia, PA",
    name: "Philadelphia Half Marathon",
    weekOffset: -18,
  },
  {
    division: "Mixed Doubles",
    durationDays: 1,
    eventType: "hyrox",
    location: "New York, NY",
    name: "HYROX New York",
    weekOffset: -10,
  },
  {
    eventType: "run",
    location: "Beacon, NY",
    name: "Hudson Valley 10K",
    weekOffset: -4,
  },
  {
    eventType: "run",
    location: "Brooklyn, NY",
    name: "Summer Track 5K",
    weekOffset: 2,
  },
  {
    division: "Pro Singles",
    durationDays: 1,
    eventType: "hyrox",
    location: "Boston, MA",
    name: "HYROX Boston",
    weekOffset: 6,
  },
  {
    eventType: "run",
    location: "Brooklyn, NY",
    name: "Brooklyn Half Marathon",
    weekOffset: 11,
  },
  {
    division: "Pro Doubles",
    durationDays: 1,
    eventType: "hyrox",
    location: "Toronto, ON",
    name: "HYROX Toronto",
    weekOffset: 16,
  },
  {
    durationDays: 1,
    eventType: "other",
    location: "Austin, TX",
    name: "Fall Fitness Festival",
    weekOffset: 21,
  },
  {
    division: "Elite 15 Singles",
    durationDays: 1,
    eventType: "hyrox",
    location: "Las Vegas, NV",
    name: "HYROX Las Vegas",
    weekOffset: 26,
  },
];

export const generateRaces = (referenceDate: string): RaceDoc[] => {
  const reference = parseIsoDate(referenceDate);
  const nextSaturday = getNextWeekday(reference, 6);

  return RACE_TEMPLATES.map(({ durationDays = 0, weekOffset, ...race }) => {
    const startDate = addDays(nextSaturday, weekOffset * 7);
    const startOffset = Math.round(
      (startDate.getTime() - reference.getTime()) / (24 * 60 * 60 * 1000),
    );
    const createdOffset = Math.min(startOffset - 60, -45);
    const updatedOffset = Math.min(startOffset - 20, -2);

    return {
      ...race,
      createdAt: addDays(reference, createdOffset).getTime(),
      endDate: toIsoDate(addDays(startDate, durationDays)),
      startDate: toIsoDate(startDate),
      updatedAt: addDays(reference, updatedOffset).getTime(),
    };
  });
};

const main = () => {
  const options = parsePreviewSeedArgs({
    argv: process.argv.slice(2),
    command: "bun scripts/generate_preview_races_import.ts",
    defaultOutput: DEFAULT_OUTPUT,
    description: "Generate representative past and upcoming preview races.",
  });

  if (!options) return;

  const races = generateRaces(options.referenceDate);
  const outputPath = writePreviewJsonl(options.output, races);
  const pastCount = races.filter(
    ({ endDate }) => endDate < options.referenceDate,
  ).length;

  process.stdout.write(
    `Generated ${races.length} races (${pastCount} past, ${races.length - pastCount} upcoming) at ${outputPath}\n`,
  );
};

if (import.meta.main) main();
