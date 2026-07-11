import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type WorkoutDoc = {
  burpees?: number;
  carbs?: number;
  cardioMinutes?: number;
  isHidden: boolean;
  lt1Miles?: number;
  lt2Miles?: number;
  notes?: string;
  rpe: number;
  speedMiles?: number;
  tags: string[];
  title: string;
  totalBikeMiles?: number;
  totalRowKs?: number;
  totalRunMiles?: number;
  totalSkiKs?: number;
  trainingMinutes: number;
  vo2Miles?: number;
  wallballs?: number;
  week: string;
  workoutDate: string;
  workoutPlan: string;
};

type WorkoutKind =
  | "aerobicRun"
  | "bikeThreshold"
  | "hyroxQuality"
  | "longRun"
  | "mobility"
  | "raceSimulation"
  | "rowSki"
  | "runIntervals"
  | "sledStrength"
  | "strength";

type CliOptions = {
  endDate: string;
  output: string;
  seed: string;
  weeks: number;
};

const DEFAULT_OUTPUT = ".generated/convex-preview-workouts.jsonl";
const DEFAULT_WEEKS = 52;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const DAY_TEMPLATES: WorkoutKind[][] = [
  ["longRun", "mobility", "strength"],
  ["aerobicRun", "strength", "bikeThreshold"],
  ["runIntervals", "rowSki", "mobility"],
  ["hyroxQuality", "sledStrength", "aerobicRun"],
  ["bikeThreshold", "strength", "mobility"],
  ["raceSimulation", "aerobicRun", "rowSki"],
  ["mobility", "longRun", "sledStrength"],
];

const TITLE_BY_KIND: Record<WorkoutKind, string[]> = {
  aerobicRun: ["Aerobic Run", "Easy Run", "Zone 2 Run"],
  bikeThreshold: ["Bike Threshold", "Bike Tempo", "Aerobic Bike Intervals"],
  hyroxQuality: ["HYROX Quality Session", "HYROX Combo Intervals"],
  longRun: ["Long Aerobic Run", "Progression Long Run"],
  mobility: ["Mobility + Recovery", "Recovery Flush"],
  raceSimulation: ["HYROX Race Simulation", "Race Pace Rehearsal"],
  rowSki: ["Row + Ski Conditioning", "Machine Conditioning"],
  runIntervals: ["Run Intervals", "Threshold Run Repeats"],
  sledStrength: ["Sled Strength", "Heavy Sled Push/Pull"],
  strength: ["Strength Circuit", "Functional Strength"],
};

const PLAN_BY_KIND: Record<WorkoutKind, string[]> = {
  aerobicRun: [
    "Conversational aerobic run. Keep cadence smooth and finish with 4 relaxed strides.",
    "Easy endurance run with a controlled heart rate cap. No surges today.",
  ],
  bikeThreshold: [
    "Bike warm-up, then 4 x 6:00 steady threshold with 2:00 easy spin between reps.",
    "Progressive bike tempo. Build from aerobic pressure to controlled threshold.",
  ],
  hyroxQuality: [
    "Mixed HYROX intervals: run repeats paired with wall balls, burpees, and machine work.",
    "Quality compromised-running session. Keep transitions crisp and pacing repeatable.",
  ],
  longRun: [
    "Long aerobic run. Keep the first half patient and close slightly stronger.",
    "Durable aerobic run with the final 15 minutes at steady pressure.",
  ],
  mobility: [
    "Low-intensity mobility, breathing, and easy aerobic flush.",
    "Recovery-focused session: hips, calves, thoracic rotation, and easy movement.",
  ],
  raceSimulation: [
    "Controlled HYROX simulation with race-pace stations and short run recoveries.",
    "Race rehearsal. Practice station setup, transitions, and sustainable pacing.",
  ],
  rowSki: [
    "Alternating row and ski intervals. Keep output smooth and repeatable.",
    "Machine conditioning with steady splits and a strong technical focus.",
  ],
  runIntervals: [
    "Run warm-up, then threshold and speed intervals with full form reset between reps.",
    "Quality running session. Keep fast reps sharp without turning it into a race.",
  ],
  sledStrength: [
    "Heavy sled push/pull paired with trunk and posterior-chain accessories.",
    "Sled strength emphasis. Long rests, high intent, clean mechanics.",
  ],
  strength: [
    "Full-body strength circuit with carries, lunges, pulls, and trunk work.",
    "Functional strength session focused on repeatable movement quality.",
  ],
};

const TAGS_BY_KIND: Record<WorkoutKind, string[]> = {
  aerobicRun: ["Aerobic Run"],
  bikeThreshold: ["Quality Cross Training"],
  hyroxQuality: ["Quality HYROX", "Muscular Endurance"],
  longRun: ["Aerobic Run"],
  mobility: ["Aerobic Cross Training"],
  raceSimulation: ["Race", "Quality HYROX"],
  rowSki: ["Aerobic Cross Training"],
  runIntervals: ["Quality Running"],
  sledStrength: ["Sleds", "Strength"],
  strength: ["Strength", "Muscular Endurance"],
};

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

const printHelp = () => {
  process.stdout.write(`Generate Convex JSONL seed data for preview workout deployments.

Usage:
  bun scripts/generate_preview_workouts_import.ts [options]

Options:
  --output <path>    Output JSONL path. Default: ${DEFAULT_OUTPUT}
  --weeks <number>   Number of weeks to generate. Default: ${DEFAULT_WEEKS}
  --end-date <date>  Last generated workout date in yyyy-MM-dd format. Default: today
  --seed <value>     Deterministic random seed. Default: preview branch/env seed
  --help             Show this help text
`);
};

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    endDate: todayIsoDate(),
    output: DEFAULT_OUTPUT,
    seed:
      process.env.CONVEX_PREVIEW_SEED ??
      process.env.VERCEL_GIT_COMMIT_REF ??
      process.env.GITHUB_HEAD_REF ??
      process.env.GITHUB_REF_NAME ??
      "threshold-preview",
    weeks: DEFAULT_WEEKS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    const nextValue = argv[index + 1];

    if (!nextValue || nextValue.startsWith("--")) {
      throw new Error(`${arg} requires a value.`);
    }

    if (arg === "--output") {
      options.output = nextValue;
    } else if (arg === "--weeks") {
      options.weeks = Number.parseInt(nextValue, 10);
    } else if (arg === "--end-date") {
      options.endDate = nextValue;
    } else if (arg === "--seed") {
      options.seed = nextValue;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }

    index += 1;
  }

  if (!Number.isInteger(options.weeks) || options.weeks < 1) {
    throw new Error("--weeks must be a positive integer.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.endDate)) {
    throw new Error("--end-date must use yyyy-MM-dd format.");
  }

  return options;
};

const hashSeed = (seed: string) => {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const createRandom = (seed: string) => {
  let state = hashSeed(seed);

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const randomInt = (random: () => number, min: number, max: number) =>
  Math.floor(random() * (max - min + 1)) + min;

const randomFloat = (
  random: () => number,
  min: number,
  max: number,
  decimals = 1,
) => {
  const value = random() * (max - min) + min;
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
};

const pickOne = <T>(items: T[], random: () => number) =>
  items[randomInt(random, 0, items.length - 1)];

const parseIsoDate = (value: string) => {
  const date = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return date;
};

const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * MS_PER_DAY);

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const getIsoWeekMonday = (date: Date) => {
  const day = date.getUTCDay();
  const daysBack = day === 0 ? 6 : day - 1;
  return toIsoDate(addDays(date, -daysBack));
};

const scaleWeek = (weekIndex: number, weeks: number) =>
  0.9 + (weekIndex / Math.max(weeks - 1, 1)) * 0.28;

const withCommonFields = (
  base: Omit<
    WorkoutDoc,
    "isHidden" | "notes" | "week" | "workoutDate" | "workoutPlan"
  > & {
    workoutPlan: string;
  },
  date: Date,
  kind: WorkoutKind,
): WorkoutDoc => ({
  ...base,
  isHidden: false,
  notes: `Generated preview ${kind} session for UI and chart QA.`,
  week: getIsoWeekMonday(date),
  workoutDate: toIsoDate(date),
});

const buildWorkout = ({
  date,
  dayWorkoutIndex,
  kind,
  random,
  weekIndex,
  weeks,
}: {
  date: Date;
  dayWorkoutIndex: number;
  kind: WorkoutKind;
  random: () => number;
  weekIndex: number;
  weeks: number;
}): WorkoutDoc => {
  const loadScale = scaleWeek(weekIndex, weeks);
  const title = `${pickOne(TITLE_BY_KIND[kind], random)} ${dayWorkoutIndex + 1}`;
  const workoutPlan = pickOne(PLAN_BY_KIND[kind], random);
  const tags = TAGS_BY_KIND[kind];

  if (kind === "aerobicRun") {
    const trainingMinutes = Math.round(randomInt(random, 38, 62) * loadScale);
    const totalRunMiles = randomFloat(random, 4.2, 7.2);
    const lt1Miles = randomFloat(random, 0.6, 1.4);

    return withCommonFields(
      {
        carbs: randomInt(random, 25, 55),
        cardioMinutes: trainingMinutes,
        lt1Miles,
        rpe: randomFloat(random, 3.2, 4.8),
        tags,
        title,
        totalRunMiles,
        trainingMinutes,
        workoutPlan,
      },
      date,
      kind,
    );
  }

  if (kind === "bikeThreshold") {
    const trainingMinutes = Math.round(randomInt(random, 45, 70) * loadScale);

    return withCommonFields(
      {
        carbs: randomInt(random, 35, 75),
        cardioMinutes: trainingMinutes,
        rpe: randomFloat(random, 6.2, 7.8),
        tags,
        title,
        totalBikeMiles: randomFloat(random, 13, 24),
        trainingMinutes,
        workoutPlan,
      },
      date,
      kind,
    );
  }

  if (kind === "hyroxQuality") {
    const trainingMinutes = Math.round(randomInt(random, 55, 82) * loadScale);
    const totalRunMiles = randomFloat(random, 3.2, 5.6);
    const lt2Miles = randomFloat(random, 0.8, 1.5);

    return withCommonFields(
      {
        burpees: randomInt(random, 35, 80),
        carbs: randomInt(random, 45, 85),
        cardioMinutes: trainingMinutes,
        lt2Miles,
        rpe: randomFloat(random, 7.1, 8.6),
        tags,
        title,
        totalRowKs: randomFloat(random, 1.2, 2.4),
        totalRunMiles,
        totalSkiKs: randomFloat(random, 1.2, 2.4),
        trainingMinutes,
        wallballs: randomInt(random, 60, 120),
        workoutPlan,
      },
      date,
      kind,
    );
  }

  if (kind === "longRun") {
    const trainingMinutes = Math.round(randomInt(random, 70, 105) * loadScale);
    const totalRunMiles = randomFloat(random, 7.5, 11.5);
    const lt1Miles = randomFloat(random, 1.2, 2.4);

    return withCommonFields(
      {
        carbs: randomInt(random, 60, 100),
        cardioMinutes: trainingMinutes,
        lt1Miles,
        rpe: randomFloat(random, 4.4, 6.1),
        tags,
        title,
        totalRunMiles,
        trainingMinutes,
        workoutPlan,
      },
      date,
      kind,
    );
  }

  if (kind === "mobility") {
    const trainingMinutes = randomInt(random, 22, 42);

    return withCommonFields(
      {
        cardioMinutes: randomInt(random, 10, 24),
        rpe: randomFloat(random, 1.4, 2.8),
        tags,
        title,
        trainingMinutes,
        workoutPlan,
      },
      date,
      kind,
    );
  }

  if (kind === "raceSimulation") {
    const trainingMinutes = Math.round(randomInt(random, 75, 105) * loadScale);

    return withCommonFields(
      {
        burpees: randomInt(random, 60, 95),
        carbs: randomInt(random, 80, 130),
        cardioMinutes: trainingMinutes,
        lt2Miles: randomFloat(random, 1.4, 2.2),
        rpe: randomFloat(random, 8.0, 9.4),
        speedMiles: randomFloat(random, 0.4, 1.1),
        tags,
        title,
        totalRowKs: randomFloat(random, 1.6, 2.5),
        totalRunMiles: randomFloat(random, 5.4, 7.1),
        totalSkiKs: randomFloat(random, 1.5, 2.4),
        trainingMinutes,
        wallballs: randomInt(random, 80, 140),
        workoutPlan,
      },
      date,
      kind,
    );
  }

  if (kind === "rowSki") {
    const trainingMinutes = Math.round(randomInt(random, 35, 58) * loadScale);

    return withCommonFields(
      {
        cardioMinutes: trainingMinutes,
        rpe: randomFloat(random, 4.6, 6.5),
        tags,
        title,
        totalRowKs: randomFloat(random, 3.2, 6.8),
        totalSkiKs: randomFloat(random, 2.5, 5.5),
        trainingMinutes,
        workoutPlan,
      },
      date,
      kind,
    );
  }

  if (kind === "runIntervals") {
    const trainingMinutes = Math.round(randomInt(random, 48, 72) * loadScale);
    const speedMiles = randomFloat(random, 0.5, 1.4);
    const vo2Miles = randomFloat(random, 0.3, 1);
    const lt2Miles = randomFloat(random, 0.8, 1.8);

    return withCommonFields(
      {
        carbs: randomInt(random, 45, 85),
        cardioMinutes: trainingMinutes,
        lt2Miles,
        rpe: randomFloat(random, 7.0, 8.7),
        speedMiles,
        tags,
        title,
        totalRunMiles: randomFloat(
          random,
          speedMiles + vo2Miles + lt2Miles + 2,
          6.8,
        ),
        trainingMinutes,
        vo2Miles,
        workoutPlan,
      },
      date,
      kind,
    );
  }

  if (kind === "sledStrength") {
    const trainingMinutes = Math.round(randomInt(random, 40, 62) * loadScale);

    return withCommonFields(
      {
        burpees: randomInt(random, 20, 55),
        rpe: randomFloat(random, 6.4, 8.2),
        tags,
        title,
        trainingMinutes,
        wallballs: randomInt(random, 30, 80),
        workoutPlan,
      },
      date,
      kind,
    );
  }

  const trainingMinutes = Math.round(randomInt(random, 42, 66) * loadScale);

  return withCommonFields(
    {
      burpees: randomInt(random, 15, 45),
      rpe: randomFloat(random, 5.2, 7.0),
      tags,
      title,
      trainingMinutes,
      wallballs: randomInt(random, 40, 100),
      workoutPlan,
    },
    date,
    kind,
  );
};

const pickWorkoutKinds = (date: Date, count: number, random: () => number) => {
  const dayTemplates = DAY_TEMPLATES[date.getUTCDay()];
  const startOffset = randomInt(random, 0, dayTemplates.length - 1);
  return Array.from({ length: count }, (_, index) => {
    return dayTemplates[(startOffset + index) % dayTemplates.length];
  });
};

const generateWorkouts = (options: CliOptions) => {
  const random = createRandom(options.seed);
  const endDate = parseIsoDate(options.endDate);
  const totalDays = options.weeks * 7;
  const startDate = addDays(endDate, -(totalDays - 1));
  const workouts: WorkoutDoc[] = [];

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset += 1) {
    const date = addDays(startDate, dayOffset);
    const weekIndex = Math.floor(dayOffset / 7);
    const workoutsToday = randomInt(random, 1, 3);
    const kinds = pickWorkoutKinds(date, workoutsToday, random);

    for (let workoutIndex = 0; workoutIndex < kinds.length; workoutIndex += 1) {
      workouts.push(
        buildWorkout({
          date,
          dayWorkoutIndex: workoutIndex,
          kind: kinds[workoutIndex],
          random,
          weekIndex,
          weeks: options.weeks,
        }),
      );
    }
  }

  return workouts;
};

const main = () => {
  const options = parseArgs(process.argv.slice(2));
  const workouts = generateWorkouts(options);
  const outputPath = resolve(process.cwd(), options.output);
  const jsonl = `${workouts.map((workout) => JSON.stringify(workout)).join("\n")}\n`;

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, jsonl, "utf8");

  process.stdout.write(
    `Generated ${workouts.length} workouts at ${outputPath}\n`,
  );
};

main();
