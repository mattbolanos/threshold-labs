import { spawnSync } from "node:child_process";

type SeedTarget =
  | { kind: "deployment"; value: string }
  | { kind: "preview"; value: string };

type SeedConvexDataOptions = {
  referenceDate?: string;
  seed?: string;
  target: SeedTarget;
};

const DEFAULT_POST_PATH = ".generated/convex-preview-posts.jsonl";
const DEFAULT_RACE_PATH = ".generated/convex-preview-races.jsonl";
const DEFAULT_TRAINING_BLOCK_PATH =
  ".generated/convex-preview-training-blocks.jsonl";
const DEFAULT_WORKOUT_PATH = ".generated/convex-preview-workouts.jsonl";

export const runCommand = (command: string, args: string[]) => {
  process.stdout.write(`$ ${[command, ...args].join(" ")}\n`);

  const result = spawnSync(command, args, {
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const getTargetArgs = (target: SeedTarget) => {
  if (target.kind === "preview") {
    return ["--preview-name", target.value];
  }

  return ["--deployment", target.value];
};

export const seedConvexData = ({
  referenceDate = new Date().toISOString().slice(0, 10),
  seed,
  target,
}: SeedConvexDataOptions) => {
  const postPath =
    process.env.CONVEX_SEED_POSTS_PATH ??
    process.env.CONVEX_PREVIEW_POSTS_SEED_PATH ??
    DEFAULT_POST_PATH;
  const racePath =
    process.env.CONVEX_SEED_RACES_PATH ??
    process.env.CONVEX_PREVIEW_RACES_SEED_PATH ??
    DEFAULT_RACE_PATH;
  const trainingBlockPath =
    process.env.CONVEX_SEED_TRAINING_BLOCKS_PATH ??
    process.env.CONVEX_PREVIEW_TRAINING_BLOCKS_SEED_PATH ??
    DEFAULT_TRAINING_BLOCK_PATH;
  const workoutPath =
    process.env.CONVEX_SEED_WORKOUTS_PATH ??
    process.env.CONVEX_PREVIEW_SEED_PATH ??
    DEFAULT_WORKOUT_PATH;
  const targetArgs = getTargetArgs(target);
  const workoutSeed = seed ?? target.value;

  runCommand("bun", [
    "scripts/generate_preview_workouts_import.ts",
    "--output",
    workoutPath,
    "--end-date",
    referenceDate,
    "--seed",
    workoutSeed,
  ]);

  runCommand("bun", [
    "scripts/generate_preview_posts_import.ts",
    "--output",
    postPath,
    "--end-date",
    referenceDate,
  ]);

  runCommand("bun", [
    "scripts/generate_preview_races_import.ts",
    "--output",
    racePath,
    "--reference-date",
    referenceDate,
  ]);

  runCommand("bun", [
    "scripts/generate_preview_training_blocks_import.ts",
    "--output",
    trainingBlockPath,
    "--reference-date",
    referenceDate,
  ]);

  for (const [table, path] of [
    ["workouts", workoutPath],
    ["posts", postPath],
    ["races", racePath],
    ["trainingBlocks", trainingBlockPath],
  ]) {
    runCommand("bunx", [
      "convex",
      "import",
      ...targetArgs,
      "--table",
      table,
      "--replace",
      "--yes",
      path,
    ]);
  }
};

const printHelp = () => {
  process.stdout.write(`Generate and import fake data into a Convex deployment.

Usage:
  bun scripts/seed_convex_data.ts --deployment <deployment> [options]
  bun scripts/seed_convex_data.ts --preview-name <name> [options]

Options:
  --deployment <deployment>  Convex deployment reference, such as dev or local
  --preview-name <name>       Convex preview deployment name
  --reference-date <date>     Date used as today in yyyy-MM-dd format
  --seed <value>              Deterministic workout seed
  --help                      Show this help text
`);
};

const parseArgs = (argv: string[]): SeedConvexDataOptions | null => {
  let deployment: string | undefined;
  let previewName: string | undefined;
  let referenceDate: string | undefined;
  let seed: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      printHelp();
      return null;
    }

    const nextValue = argv[index + 1];

    if (!nextValue || nextValue.startsWith("--")) {
      throw new Error(`${arg} requires a value.`);
    }

    if (arg === "--deployment") {
      deployment = nextValue;
    } else if (arg === "--preview-name") {
      previewName = nextValue;
    } else if (arg === "--reference-date") {
      referenceDate = nextValue;
    } else if (arg === "--seed") {
      seed = nextValue;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }

    index += 1;
  }

  if (deployment && previewName) {
    throw new Error("Choose either --deployment or --preview-name, not both.");
  }

  if (!deployment && !previewName) {
    throw new Error("Set --deployment or --preview-name.");
  }

  if (referenceDate && !/^\d{4}-\d{2}-\d{2}$/.test(referenceDate)) {
    throw new Error("--reference-date must use yyyy-MM-dd format.");
  }

  return {
    referenceDate,
    seed,
    target: previewName
      ? { kind: "preview", value: previewName }
      : { kind: "deployment", value: deployment as string },
  };
};

if (import.meta.main) {
  const options = parseArgs(process.argv.slice(2));

  if (options) {
    seedConvexData(options);
  }
}
