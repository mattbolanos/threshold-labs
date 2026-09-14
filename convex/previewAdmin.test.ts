import {
  afterAll,
  afterEach,
  beforeEach,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  assertAdmin,
  authComponent,
  getEffectiveAuthUser,
  getLabAccess,
} from "./auth";
import { getSession, setEnabled } from "./previewAdmin";

// Convex handlers are exposed at runtime but omitted from its public types.
const { _handler: toggle } = setEnabled as unknown as {
  _handler: (ctx: MutationCtx, args: { enabled: boolean }) => Promise<void>;
};
const { _handler: hasSession } = getSession as unknown as {
  _handler: (ctx: QueryCtx) => Promise<boolean>;
};

const originalVercelEnv = process.env.VERCEL_ENV;
const originalBypass = process.env.PREVIEW_AUTH_BYPASS;
const auth = spyOn(authComponent, "safeGetAuthUser");
const user = {
  _id: "member-1",
  email: "member@example.com",
  name: "Member",
  role: "client",
} as NonNullable<Awaited<ReturnType<typeof authComponent.safeGetAuthUser>>>;
const sessions = new Map<string, Doc<"previewAdminSessions">>();
const getUserIdentity = mock(async () => ({
  sessionId: "session-1",
  subject: user._id,
}));
const insert = mock(
  async (_table: string, session: { sessionId: string; userId: string }) => {
    sessions.set(session.sessionId, {
      ...session,
      _creationTime: 0,
      _id: session.sessionId as Doc<"previewAdminSessions">["_id"],
    });
  },
);
const remove = mock(async (id: string) => {
  sessions.delete(id);
});
const ctx = {
  auth: { getUserIdentity },
  db: {
    delete: remove,
    insert,
    query: () => ({
      withIndex: (
        _index: string,
        filter: (q: { eq: (field: string, value: string) => string }) => string,
      ) => {
        const sessionId = filter({ eq: (_field, value) => value });
        return { unique: async () => sessions.get(sessionId) ?? null };
      },
    }),
  },
  runQuery: async () => hasSession(ctx),
} as unknown as MutationCtx;

beforeEach(() => {
  process.env.VERCEL_ENV = "preview";
  process.env.PREVIEW_AUTH_BYPASS = "false";
  auth.mockResolvedValue(user);
  getUserIdentity.mockResolvedValue({
    sessionId: "session-1",
    subject: user._id,
  });
});

afterEach(() => {
  sessions.clear();
  insert.mockClear();
  remove.mockClear();
  auth.mockReset();
  if (originalVercelEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalVercelEnv;
  if (originalBypass === undefined) delete process.env.PREVIEW_AUTH_BYPASS;
  else process.env.PREVIEW_AUTH_BYPASS = originalBypass;
});

afterAll(() => auth.mockRestore());

test("grants session admin access and restores the saved role when disabled", async () => {
  await expect(assertAdmin(ctx)).rejects.toThrow(
    "Administrator access is required",
  );

  await toggle(ctx, { enabled: true });
  expect(await assertAdmin(ctx)).toMatchObject({
    previewAdmin: true,
    role: "admin",
  });
  expect(await getLabAccess(ctx)).toMatchObject({
    hasAccess: true,
    source: "admin",
  });
  expect(user.role).toBe("client");

  await toggle(ctx, { enabled: false });
  expect(await getEffectiveAuthUser(ctx)).toMatchObject({
    previewAdmin: false,
    role: "client",
  });
  await expect(assertAdmin(ctx)).rejects.toThrow(
    "Administrator access is required",
  );
});

test("does not grant access to another login session or user", async () => {
  await toggle(ctx, { enabled: true });
  getUserIdentity.mockResolvedValue({
    sessionId: "session-2",
    subject: user._id,
  });
  await expect(assertAdmin(ctx)).rejects.toThrow(
    "Administrator access is required",
  );

  getUserIdentity.mockResolvedValue({
    sessionId: "session-1",
    subject: "member-2" as typeof user._id,
  });
  expect(await hasSession(ctx)).toBe(false);
});

test("requires a valid authenticated session even if an override exists", async () => {
  await toggle(ctx, { enabled: true });
  auth.mockResolvedValue(undefined);
  await expect(toggle(ctx, { enabled: true })).rejects.toThrow(
    "Please sign in",
  );
  expect(await getEffectiveAuthUser(ctx)).toBeNull();
  await expect(assertAdmin(ctx)).rejects.toThrow(
    "Administrator access is required",
  );
});

test("blocks toggles and ignores existing overrides outside Vercel preview", async () => {
  await toggle(ctx, { enabled: true });
  for (const environment of ["production", "development", undefined]) {
    if (environment === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = environment;
    await expect(toggle(ctx, { enabled: true })).rejects.toThrow(
      "only available in Vercel previews",
    );
    await expect(toggle(ctx, { enabled: false })).rejects.toThrow(
      "only available in Vercel previews",
    );
    expect(await hasSession(ctx)).toBe(false);
    await expect(assertAdmin(ctx)).rejects.toThrow(
      "Administrator access is required",
    );
  }
});

test("disabling impersonation preserves a real admin's permissions", async () => {
  auth.mockResolvedValue({ ...user, role: "admin" });
  await toggle(ctx, { enabled: true });
  await toggle(ctx, { enabled: false });
  expect(await assertAdmin(ctx)).toMatchObject({
    previewAdmin: false,
    role: "admin",
  });
});

test("repeated toggle requests are idempotent", async () => {
  await toggle(ctx, { enabled: true });
  await toggle(ctx, { enabled: true });
  expect(insert).toHaveBeenCalledTimes(1);
  await toggle(ctx, { enabled: false });
  await toggle(ctx, { enabled: false });
  expect(remove).toHaveBeenCalledTimes(1);
});
