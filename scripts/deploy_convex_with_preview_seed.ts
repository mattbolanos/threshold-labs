import { runCommand, seedConvexData } from "./seed_convex_data";
import {
  getConvexPreviewName,
  shouldSeedConvexPreview,
} from "./sync_convex_preview_environment";

const previewName = getConvexPreviewName(process.env);
const shouldSeedPreview = shouldSeedConvexPreview(process.env);
const deployArgs = [
  "convex",
  "deploy",
  "--cmd",
  "bun scripts/build_with_convex_preview_environment.ts",
  "--cmd-url-env-var-name",
  "NEXT_PUBLIC_CONVEX_URL",
];

if (process.env.CONVEX_DEPLOY_KEY?.startsWith("preview:")) {
  if (!previewName) {
    throw new Error(
      "Missing preview name. Set CONVEX_PREVIEW_NAME, VERCEL_GIT_COMMIT_REF, GITHUB_HEAD_REF, or GITHUB_REF_NAME.",
    );
  }

  deployArgs.push("--preview-name", previewName);
}

runCommand("bunx", deployArgs);

if (!shouldSeedPreview) {
  process.stdout.write(
    "Skipping Convex seed; preserving existing deployment data.\n",
  );
  process.exit(0);
}

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
