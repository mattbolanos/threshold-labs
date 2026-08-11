import { runCommand, seedConvexData } from "./seed_convex_data";

const getPreviewName = () =>
  process.env.CONVEX_PREVIEW_NAME ??
  process.env.VERCEL_GIT_COMMIT_REF ??
  process.env.GITHUB_HEAD_REF ??
  process.env.GITHUB_REF_NAME;

const shouldSeedPreview = () =>
  process.env.CONVEX_SEED_PREVIEW === "true" ||
  process.env.VERCEL_ENV === "preview";

runCommand("bunx", [
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

const referenceDate =
  process.env.CONVEX_PREVIEW_REFERENCE_DATE ??
  new Date().toISOString().slice(0, 10);

seedConvexData({
  referenceDate,
  seed: previewName,
  target: { kind: "preview", value: previewName },
});
