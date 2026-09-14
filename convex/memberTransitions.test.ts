import { expect, mock, test } from "bun:test";
import type { Doc, Id } from "./_generated/dataModel";
import type { ActionCtx } from "./_generated/server";
import { deliverInvitation } from "./memberTransitions";

const deliver = (
  deliverInvitation as unknown as {
    _handler: (
      ctx: ActionCtx,
      args: { discountCodeId: Id<"discountCodes"> },
    ) => Promise<void>;
  }
)._handler;
const discountCodeId = "offer_123" as Id<"discountCodes">;

function createContext(
  overrides: Partial<Doc<"discountCodes">> = {},
  deliveryFails = false,
) {
  const runQuery = mock(async () => ({
    _id: discountCodeId,
    availableAt: Date.now() - 1000,
    code: "TL50-TEST",
    deliveryStatus: "pending",
    discountType: "fifty_monthly",
    recipientEmail: "member@example.com",
    status: "active",
    ...overrides,
  }));
  const runAction = mock(async (_reference: unknown, _args: unknown) => {
    if (deliveryFails) throw new Error("Email unavailable");
  });
  const runMutation = mock(async (_reference: unknown, _args: unknown) => {});
  return {
    ctx: { runAction, runMutation, runQuery } as unknown as ActionCtx,
    runAction,
    runMutation,
  };
}

test("scheduled invitations send the recipient-bound offer once and record delivery", async () => {
  const { ctx, runAction, runMutation } = createContext();
  await deliver(ctx, { discountCodeId });
  expect(runAction).toHaveBeenCalledTimes(1);
  expect(runAction.mock.calls[0]?.[1]).toEqual({
    code: "TL50-TEST",
    discountType: "fifty_monthly",
    recipient: "member@example.com",
  });
  expect(runMutation).toHaveBeenCalledTimes(1);
});

test("does not send revoked, redeemed, delivered, or premature invitations", async () => {
  for (const overrides of [
    { status: "revoked" as const },
    { status: "redeemed" as const },
    { deliveryStatus: "sent" as const },
    { availableAt: Date.now() + 60_000 },
  ]) {
    const { ctx, runAction, runMutation } = createContext(overrides);
    await deliver(ctx, { discountCodeId });
    expect(runAction).not.toHaveBeenCalled();
    expect(runMutation).not.toHaveBeenCalled();
  }
});

test("records delivery failures and allows retrying the same offer", async () => {
  const failed = createContext({}, true);
  await deliver(failed.ctx, { discountCodeId });
  expect(failed.runMutation.mock.calls[0]?.[1]).toEqual({
    deliveryError: "Email unavailable",
    discountCodeId,
  });
  const retry = createContext({ deliveryStatus: "failed" });
  await deliver(retry.ctx, { discountCodeId });
  expect(retry.runAction).toHaveBeenCalledTimes(1);
});
