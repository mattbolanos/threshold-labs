import type { DBAdapter } from "better-auth";
import { emailOTP } from "better-auth/plugins";

export const EMAIL_OTP_SIGN_IN_PATH = "/api/auth/sign-in/email-otp";

export type EmailOtpHttpRequest = {
  body: string;
  headers: Record<string, string>;
  url: string;
};

export type EmailOtpHttpResponse = {
  body: string;
  headers: [string, string][];
  status: number;
};

/** Issuance goes through our rate-limited action, never another public route. */
export function createEmailOtpPlugin(options: Parameters<typeof emailOTP>[0]) {
  const plugin = emailOTP(options);
  return {
    ...plugin,
    endpoints: {
      createVerificationOTP: plugin.endpoints.createVerificationOTP,
      signInEmailOTP: plugin.endpoints.signInEmailOTP,
    },
  };
}

/** Call inside the same mutation as OTP creation or verification. */
export async function clearSignInOtps(
  adapter: Pick<DBAdapter, "deleteMany" | "findMany">,
  email: string,
  keepLatest = false,
) {
  // Better Auth 1.6's email-otp plugin uses this identifier format.
  const where = [{ field: "identifier", value: `sign-in-otp-${email}` }];
  const [latest] = keepLatest
    ? await adapter.findMany<{ id: string }>({
        limit: 1,
        model: "verification",
        sortBy: { direction: "desc", field: "createdAt" },
        where,
      })
    : [];

  await adapter.deleteMany({
    model: "verification",
    where: latest
      ? [...where, { field: "id", operator: "not_in", value: [latest.id] }]
      : where,
  });
}

export async function serializeAuthResponse(
  response: Response,
): Promise<EmailOtpHttpResponse> {
  const headers = [...response.headers.entries()].filter(
    ([name]) => name !== "set-cookie",
  );
  for (const cookie of response.headers.getSetCookie()) {
    headers.push(["set-cookie", cookie]);
  }
  return { body: await response.text(), headers, status: response.status };
}
