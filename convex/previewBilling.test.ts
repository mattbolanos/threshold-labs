import { afterEach, describe, expect, test } from "bun:test";
import { repairTrainingBlockReferences } from "./previewBilling";

const originalEnvironment = process.env.VERCEL_ENV;
afterEach(() => {
  if (originalEnvironment === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalEnvironment;
});

const block = {
  _id: "current-block",
  endDate: "2026-09-20",
  startDate: "2026-08-24",
  title: "Recovery & Rebuild",
};

function fixture(blocks = [block]) {
  const purchase = {
    _id: "purchase",
    accessEnd: block.endDate,
    accessStart: block.startDate,
    referenceId: "member",
    stripeCheckoutSessionId: "cs_test_original",
    trainingBlockId: "deleted-seed-block",
    trainingBlockTitle: block.title,
  };
  const patches: unknown[] = [];
  const ctx = {
    db: {
      patch: async (_id: string, fields: object) => {
        patches.push(fields);
        Object.assign(purchase, fields);
      },
      query: (table: string) => ({
        collect: async () => (table === "trainingBlocks" ? blocks : [purchase]),
      }),
    },
  };
  // Exercise the registered mutation without contacting a deployment.
  const run = (args = {}) =>
    (
      repairTrainingBlockReferences as unknown as {
        _handler: (ctx: unknown, args: object) => Promise<unknown>;
      }
    )._handler(ctx, args);
  return { patches, purchase, run };
}

describe("preview purchase repair", () => {
  test("repairs only an exact match, preserves payment/access data, and is idempotent", async () => {
    process.env.VERCEL_ENV = "preview";
    const { patches, purchase, run } = fixture();
    expect(await run()).toEqual({ dryRun: true, matched: 1, unchanged: 0 });
    expect(patches).toHaveLength(0);
    await run({ dryRun: false });
    expect(patches).toEqual([{ trainingBlockId: block._id }]);
    expect(purchase.stripeCheckoutSessionId).toBe("cs_test_original");
    expect(purchase.accessStart).toBe(block.startDate);
    expect(await run({ dryRun: false })).toEqual({
      dryRun: false,
      matched: 0,
      unchanged: 1,
    });
  });

  test("refuses ambiguous or missing matches without patching", async () => {
    process.env.VERCEL_ENV = "preview";
    for (const blocks of [[], [block, { ...block, _id: "duplicate" }]]) {
      const { patches, run } = fixture(blocks);
      await expect(run({ dryRun: false })).rejects.toThrow(
        "no unique title/date match",
      );
      expect(patches).toHaveLength(0);
    }
  });

  test("cannot run on production even as an internal mutation", async () => {
    process.env.VERCEL_ENV = "production";
    const { patches, run } = fixture();
    await expect(run({ dryRun: false })).rejects.toThrow("limited to previews");
    expect(patches).toHaveLength(0);
  });
});
