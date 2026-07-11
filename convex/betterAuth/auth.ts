import { createAuth } from "../auth";

// Static instance used only by the Better Auth CLI for schema generation.
export const auth = createAuth({} as never);
