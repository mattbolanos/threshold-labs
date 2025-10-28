import type { inferRouterOutputs } from "@trpc/server";
import type { appRouter } from "./root";

type RouterOutputs = inferRouterOutputs<typeof appRouter>;

export type WorkoutsOutput = RouterOutputs["internal"]["getWorkouts"];
