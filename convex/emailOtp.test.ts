import { afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { memoryAdapter } from "better-auth/adapters/memory";
import { type FunctionReference, getFunctionName } from "convex/server";
import type { ActionCtx, MutationCtx } from "./_generated/server";
import { authComponent, createAuth } from "./auth";
import { createEmailOtp, signInEmailOtp } from "./emailOtp";
import {
  EMAIL_OTP_SIGN_IN_PATH,
  type EmailOtpHttpRequest,
  type EmailOtpHttpResponse,
  serializeAuthResponse,
} from "./lib/emailOtpAuth";

const { _handler: issueCode } = createEmailOtp as unknown as {
  _handler: (ctx: MutationCtx, args: { email: string }) => Promise<string>;
};
const { _handler: authenticate } = signInEmailOtp as unknown as {
  _handler: (
    ctx: MutationCtx,
    args: EmailOtpHttpRequest,
  ) => Promise<EmailOtpHttpResponse>;
};

const email = "otp-regression@example.com";
const siteUrl = "http://localhost:3000";
const environment = {
  BETTER_AUTH_SECRET: "local-otp-test-secret-at-least-32-characters",
  GOOGLE_CLIENT_ID: "local-client",
  GOOGLE_CLIENT_SECRET: "local-secret",
  SITE_URL: siteUrl,
  STRIPE_INSIDE_LAB_PRICE_ID: "price_local_test",
  STRIPE_SECRET_KEY: "sk_test_local_only",
  STRIPE_WEBHOOK_SECRET: "whsec_local_only",
};
const originalEnvironment = Object.fromEntries(
  Object.keys(environment).map((key) => [key, process.env[key]]),
);

let database: Record<string, Record<string, unknown>[]>;
let adapterSpy: ReturnType<typeof spyOn<typeof authComponent, "adapter">>;
let actionCtx: ActionCtx;
let mutationCtx: MutationCtx;
let mutationCalls: number;
let transactionQueue: Promise<void>;

// Convex mutations are serializable across component calls. Model that
// boundary here, while exercising the actual app handlers and Better Auth.
function inTransaction<T>(operation: () => Promise<T>) {
  const result = transactionQueue.then(operation);
  transactionQueue = result.then(
    () => {},
    () => {},
  );
  return result;
}

beforeEach(() => {
  Object.assign(process.env, environment);
  database = { account: [], jwks: [], session: [], user: [], verification: [] };
  transactionQueue = Promise.resolve();
  mutationCalls = 0;
  // The memory test adapter resolves a second copy of @better-auth/core;
  // its runtime adapter contract is the same as the component's factory.
  const localAdapter = memoryAdapter(database) as unknown as ReturnType<
    typeof authComponent.adapter
  >;
  adapterSpy = spyOn(authComponent, "adapter").mockImplementation(() => {
    return (options) => {
      // Better Auth disables origin checks by default in NODE_ENV=test.
      options.advanced = { ...options.advanced, disableOriginCheck: false };
      const adapter = localAdapter(options);
      if (adapter.options) adapter.options.isRunMutationCtx = true;
      const removeMany = adapter.deleteMany.bind(adapter);
      adapter.deleteMany = async (args) => {
        // Convex maps id to _id and permits only these operators on it.
        // Keep this restriction so the memory adapter cannot hide a runtime
        // rejection of an otherwise valid Better Auth filter.
        for (const condition of args.where ?? []) {
          if (
            condition.field === "id" &&
            condition.operator &&
            !["eq", "in", "not_in"].includes(condition.operator)
          ) {
            throw new Error("_id can only be used with eq, in, or not_in");
          }
        }
        return removeMany(args);
      };
      const remove = adapter.delete.bind(adapter);
      // Unlike memoryAdapter's delete-all behavior, the installed Convex
      // adapter calls deleteOne and consumes the oldest matching record.
      adapter.delete = async ({ model, where }) => {
        const oldest = await adapter.findOne<{ id: string }>({ model, where });
        if (oldest) {
          await remove({ model, where: [{ field: "id", value: oldest.id }] });
        }
      };
      return adapter;
    };
  });
  mutationCtx = {
    db: {},
    runQuery: async () => null,
    scheduler: { runAfter: async () => "unused" },
  } as unknown as MutationCtx;
  actionCtx = {
    runMutation: async (
      reference: FunctionReference<"mutation">,
      args: EmailOtpHttpRequest,
    ) => {
      expect(getFunctionName(reference)).toBe("emailOtp:signInEmailOtp");
      mutationCalls += 1;
      return inTransaction(() => authenticate(mutationCtx, args));
    },
    runQuery: async () => null,
  } as unknown as ActionCtx;
});

afterEach(() => {
  adapterSpy.mockRestore();
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function issue() {
  return inTransaction(() => issueCode(mutationCtx, { email }));
}

function signIn(otp: string, origin = siteUrl) {
  return createAuth(actionCtx).handler(
    new Request(`${siteUrl}${EMAIL_OTP_SIGN_IN_PATH}`, {
      body: JSON.stringify({ email, name: "OTP Regression", otp }),
      headers: {
        "content-type": "application/json",
        cookie: "existing-cookie=present",
        origin,
      },
      method: "POST",
    }),
  );
}

test("resend replaces the old code and a successful code cannot be replayed", async () => {
  const first = await issue();
  const second = await issue();
  expect(database.verification).toHaveLength(1);
  if (first !== second) expect((await signIn(first)).status).toBe(400);
  const accepted = await signIn(second);
  expect(accepted.status).toBe(200);
  const cookies = accepted.headers.getSetCookie();
  expect(
    cookies.some((cookie) => cookie.startsWith("better-auth.session_token=")),
  ).toBe(true);
  expect(
    cookies.some((cookie) => cookie.startsWith("better-auth.convex_jwt=")),
  ).toBe(true);
  expect(database.verification).toHaveLength(0);
  expect((await signIn(second)).status).toBe(400);
  expect(database.session).toHaveLength(1);
  expect(mutationCalls).toBeGreaterThanOrEqual(2);
});

test("cleans legacy duplicate records before consuming the latest code", async () => {
  const auth = createAuth(mutationCtx);
  await inTransaction(() =>
    auth.api.createVerificationOTP({ body: { email, type: "sign-in" } }),
  );
  database.verification[0].createdAt = new Date(Date.now() - 31_000);
  const latest = await inTransaction(() =>
    auth.api.createVerificationOTP({ body: { email, type: "sign-in" } }),
  );
  expect(database.verification).toHaveLength(2);
  expect((await signIn(latest)).status).toBe(200);
  expect(database.verification).toHaveLength(0);
  expect((await signIn(latest)).status).toBe(400);
  expect(database.session).toHaveLength(1);
});

test("overlapping HTTP logins consume one code in exactly one mutation", async () => {
  const otp = await issue();
  const responses = await Promise.all([signIn(otp), signIn(otp)]);
  expect(responses.map((response) => response.status).sort()).toEqual([
    200, 400,
  ]);
  expect(mutationCalls).toBe(2);
  expect(database.session).toHaveLength(1);
  expect(database.verification).toHaveLength(0);
});

test("concurrent resends leave one replacement code", async () => {
  const [first, latest] = await Promise.all([issue(), issue()]);
  expect(database.verification).toHaveLength(1);
  if (first !== latest) expect((await signIn(first)).status).toBe(400);
  expect((await signIn(latest)).status).toBe(200);
  expect((await signIn(latest)).status).toBe(400);
});

test("failed attempts commit and enforce the five-attempt limit", async () => {
  const otp = await issue();
  const wrongOtp = otp === "000000" ? "999999" : "000000";
  for (let attempt = 0; attempt < 5; attempt++) {
    expect((await signIn(wrongOtp)).status).toBe(400);
  }
  expect((await signIn(otp)).status).toBe(403);
  expect(database.session).toHaveLength(0);
  expect(database.verification).toHaveLength(0);
});

test("expired codes are rejected and consumed", async () => {
  const otp = await issue();
  database.verification[0].expiresAt = new Date(Date.now() - 1_000);
  expect((await signIn(otp)).status).toBe(400);
  expect(database.verification).toHaveLength(0);
  expect(database.session).toHaveLength(0);
});

test("the mutation response preserves separate cookies with expiry dates", async () => {
  const cookies = [
    "first=1; Expires=Tue, 01 Dec 2026 00:00:00 GMT; Path=/",
    "second=2; HttpOnly; Path=/",
  ];
  const response = new Response("{}", {
    headers: cookies.map((cookie): [string, string] => ["set-cookie", cookie]),
  });
  const serialized = await serializeAuthResponse(response);
  const restored = new Response(serialized.body, serialized);
  expect(restored.headers.getSetCookie()).toEqual(cookies);
});

test("retains Better Auth origin checks inside the mutation", async () => {
  const otp = await issue();
  expect((await signIn(otp, "https://untrusted.example")).status).toBe(403);
  expect(database.session).toHaveLength(0);
  expect((await signIn(otp)).status).toBe(200);
});

test("unused public OTP endpoints cannot bypass atomic issuance", async () => {
  for (const path of ["send-verification-otp", "check-verification-otp"]) {
    const response = await createAuth(actionCtx).handler(
      new Request(`${siteUrl}/api/auth/email-otp/${path}`, {
        body: JSON.stringify({ email, otp: "123456", type: "sign-in" }),
        headers: { "content-type": "application/json", origin: siteUrl },
        method: "POST",
      }),
    );
    expect(response.status).toBe(404);
  }
  expect(database.verification).toHaveLength(0);
});
