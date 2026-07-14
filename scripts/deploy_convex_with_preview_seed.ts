import { spawnSync } from "node:child_process";

const run = (command: string, args: string[]) => {
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

const getPreviewName = () =>
  process.env.CONVEX_PREVIEW_NAME ??
  process.env.VERCEL_GIT_COMMIT_REF ??
  process.env.GITHUB_HEAD_REF ??
  process.env.GITHUB_REF_NAME;

const shouldSeedPreview = () =>
  process.env.CONVEX_SEED_PREVIEW === "true" ||
  process.env.VERCEL_ENV === "preview";

run("bunx", [
  "convex",
  "deploy",
  "--cmd",
  "bun run build",
  "--cmd-url-env-var-name",
  "NEXT_PUBLIC_CONVEX_URL",
]);

if (!shouldSeedPreview()) {
  process.stdout.write(
    "Skipping Convex preview seed outside preview deployment.\n",
  );
  process.exit(0);
}

const previewName = getPreviewName();

if (!previewName) {
  throw new Error(
    "Missing preview name. Set CONVEX_PREVIEW_NAME, VERCEL_GIT_COMMIT_REF, GITHUB_HEAD_REF, or GITHUB_REF_NAME.",
  );
}

const workoutSeedPath =
  process.env.CONVEX_PREVIEW_SEED_PATH ??
  ".generated/convex-preview-workouts.jsonl";
const postSeedPath =
  process.env.CONVEX_PREVIEW_POSTS_SEED_PATH ??
  ".generated/convex-preview-posts.jsonl";

run("bun", [
  "scripts/generate_preview_workouts_import.ts",
  "--output",
  workoutSeedPath,
  "--seed",
  previewName,
]);

run("bun", [
  "scripts/generate_preview_posts_import.ts",
  "--output",
  postSeedPath,
]);

run("bunx", [
  "convex",
  "import",
  "--preview-name",
  previewName,
  "--table",
  "workouts",
  "--replace",
  "--yes",
  workoutSeedPath,
]);

run("bunx", [
  "convex",
  "import",
  "--preview-name",
  previewName,
  "--table",
  "posts",
  "--replace",
  "--yes",
  postSeedPath,
]);
