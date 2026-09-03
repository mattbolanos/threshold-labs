import { runCommand } from "./seed_convex_data";
import { syncConvexPreviewEnvironment } from "./sync_convex_preview_environment";

syncConvexPreviewEnvironment();
runCommand("bun", ["run", "build"]);
