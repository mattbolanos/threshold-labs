import { defineSchema } from "convex/server";
import { tables } from "./generatedSchema";

const schema = defineSchema({
  ...tables,
  subscription: tables.subscription.index("referenceId", ["referenceId"]),
});

export default schema;
