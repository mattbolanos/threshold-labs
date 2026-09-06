import { afterAll, afterEach, expect, spyOn, test } from "bun:test";
import type { ActionCtx } from "./_generated/server";
import { authComponent } from "./auth";
import { sendContactMessage } from "./emails";

// Convex exposes the handler at runtime but omits it from its public types.
const { _handler: sendContact } = sendContactMessage as unknown as {
  _handler: (ctx: ActionCtx, args: { message: string }) => Promise<null>;
};

const ctx = { runQuery: () => {} } as unknown as ActionCtx;
const user = {
  email: "member@example.com",
  name: "Member",
} as NonNullable<Awaited<ReturnType<typeof authComponent.safeGetAuthUser>>>;
const auth = spyOn(authComponent, "safeGetAuthUser");
const fetchEmail = spyOn(globalThis, "fetch");
const originalKey = process.env.RESEND_API_KEY;
const originalFrom = process.env.AUTH_EMAIL_FROM;

afterAll(() => {
  auth.mockRestore();
  fetchEmail.mockRestore();
});

afterEach(() => {
  auth.mockReset();
  fetchEmail.mockReset();
  if (originalKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalKey;
  if (originalFrom === undefined) delete process.env.AUTH_EMAIL_FROM;
  else process.env.AUTH_EMAIL_FROM = originalFrom;
});

test("contact requires authentication before sending email", async () => {
  auth.mockResolvedValue(undefined);
  await expect(sendContact(ctx, { message: "Hello" })).rejects.toThrow(
    "Please sign in",
  );
  expect(fetchEmail).not.toHaveBeenCalled();
});

test("contact rejects blank and oversized messages", async () => {
  auth.mockResolvedValue(user);
  for (const message of ["   ", "a".repeat(5001)]) {
    await expect(sendContact(ctx, { message })).rejects.toThrow(
      "Enter a message",
    );
  }
  expect(fetchEmail).not.toHaveBeenCalled();
});

test("contact sends to Stephen with the authenticated reply address", async () => {
  auth.mockResolvedValue(user);
  process.env.RESEND_API_KEY = "test-key";
  process.env.AUTH_EMAIL_FROM = "Threshold Lab <hello@example.com>";
  fetchEmail.mockResolvedValue(new Response('{"id":"test"}', { status: 200 }));

  await sendContact(ctx, { message: "  Hello  " });

  const [url, options] = fetchEmail.mock.calls[0];
  expect(url).toBe("https://api.resend.com/emails");
  expect(JSON.parse(String(options?.body))).toEqual({
    from: "Threshold Lab <hello@example.com>",
    reply_to: user.email,
    subject: "Threshold Lab contact message",
    text: "From: Member <member@example.com>\n\nHello",
    to: ["stephen.pelkofer@gmail.com"],
  });
});

test("contact reports delivery failures without exposing provider details", async () => {
  auth.mockResolvedValue(user);
  process.env.RESEND_API_KEY = "test-key";
  process.env.AUTH_EMAIL_FROM = "hello@example.com";
  fetchEmail.mockResolvedValue(
    new Response("Provider details", { status: 500 }),
  );
  await expect(sendContact(ctx, { message: "Hello" })).rejects.toThrow(
    "Your message could not be sent. Please try again.",
  );
});
