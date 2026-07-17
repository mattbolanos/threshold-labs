import {
  addDays,
  getIsoWeekMonday,
  parseIsoDate,
  parsePreviewSeedArgs,
  toIsoDate,
  writePreviewJsonl,
} from "./preview_seed_utils";

type TrainingBlockDoc = {
  createdAt: number;
  description: string;
  endDate: string;
  startDate: string;
  title: string;
  updatedAt: number;
};

type TrainingBlockTemplate = Omit<
  TrainingBlockDoc,
  "createdAt" | "endDate" | "startDate" | "updatedAt"
> & {
  durationWeeks: number;
  startWeek: number;
};

const DEFAULT_OUTPUT = ".generated/convex-preview-training-blocks.jsonl";

const TRAINING_BLOCK_TEMPLATES: TrainingBlockTemplate[] = [
  {
    description:
      "Rebuild consistent aerobic volume with easy running, steady machine work, and patient long sessions.",
    durationWeeks: 6,
    startWeek: -24,
    title: "Aerobic Foundation",
  },
  {
    description:
      "Develop durable lower-body strength, heavier sled capacity, and resilient movement positions.",
    durationWeeks: 6,
    startWeek: -18,
    title: "Strength Capacity",
  },
  {
    description:
      "Raise sustainable run and machine output through threshold intervals and controlled compromised running.",
    durationWeeks: 6,
    startWeek: -12,
    title: "Threshold Development",
  },
  {
    description:
      "Translate fitness into race execution with station pairings, simulation sessions, and transition practice.",
    durationWeeks: 4,
    startWeek: -6,
    title: "Race-Specific Build",
  },
  {
    description:
      "Absorb the last build, restore movement quality, and re-establish low-intensity volume before loading again.",
    durationWeeks: 4,
    startWeek: -2,
    title: "Recovery & Rebuild",
  },
  {
    description:
      "Progress threshold volume while keeping strength exposures crisp and aerobic recovery genuinely easy.",
    durationWeeks: 6,
    startWeek: 2,
    title: "Aerobic Power",
  },
  {
    description:
      "Build race-specific density, repeatable station output, and confident pacing under accumulated fatigue.",
    durationWeeks: 6,
    startWeek: 8,
    title: "Competition Prep",
  },
  {
    description:
      "Reduce volume, preserve intensity, and arrive fresh with rehearsed pacing and calm transitions.",
    durationWeeks: 2,
    startWeek: 14,
    title: "Race Taper",
  },
];

export const generateTrainingBlocks = (
  referenceDate: string,
): TrainingBlockDoc[] => {
  const reference = parseIsoDate(referenceDate);
  const referenceWeek = getIsoWeekMonday(reference);

  return TRAINING_BLOCK_TEMPLATES.map(
    ({ durationWeeks, startWeek, ...block }) => {
      const startDate = addDays(referenceWeek, startWeek * 7);
      const endDate = addDays(startDate, durationWeeks * 7 - 1);
      const createdOffset = Math.min(startWeek * 7 - 21, -45);
      const updatedOffset = Math.min(startWeek * 7 - 3, -1);

      return {
        ...block,
        createdAt: addDays(reference, createdOffset).getTime(),
        endDate: toIsoDate(endDate),
        startDate: toIsoDate(startDate),
        updatedAt: addDays(reference, updatedOffset).getTime(),
      };
    },
  );
};

const main = () => {
  const options = parsePreviewSeedArgs({
    argv: process.argv.slice(2),
    command: "bun scripts/generate_preview_training_blocks_import.ts",
    defaultOutput: DEFAULT_OUTPUT,
    description:
      "Generate representative completed, current, and upcoming preview training blocks.",
  });

  if (!options) return;

  const blocks = generateTrainingBlocks(options.referenceDate);
  const outputPath = writePreviewJsonl(options.output, blocks);
  const completeCount = blocks.filter(
    ({ endDate }) => endDate < options.referenceDate,
  ).length;
  const upcomingCount = blocks.filter(
    ({ startDate }) => startDate > options.referenceDate,
  ).length;
  const currentCount = blocks.length - completeCount - upcomingCount;

  process.stdout.write(
    `Generated ${blocks.length} training blocks (${completeCount} complete, ${currentCount} current, ${upcomingCount} upcoming) at ${outputPath}\n`,
  );
};

if (import.meta.main) main();
