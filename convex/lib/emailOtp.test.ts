import { describe, expect, test } from "bun:test";
import { createEmailOtpMessage, getEmailOtpRequestStatus } from "./emailOtp";

describe("getEmailOtpRequestStatus", () => {
  test("requires signup when login has no matching account", () => {
    expect(getEmailOtpRequestStatus({ mode: "login", userExists: false })).toBe(
      "signup_required",
    );
  });

  test("requires login when signup already has a matching account", () => {
    expect(getEmailOtpRequestStatus({ mode: "signup", userExists: true })).toBe(
      "login_required",
    );
  });

  test("sends only for the matching account intent", () => {
    expect(getEmailOtpRequestStatus({ mode: "login", userExists: true })).toBe(
      "sent",
    );
    expect(
      getEmailOtpRequestStatus({ mode: "signup", userExists: false }),
    ).toBe("sent");
  });
});

describe("createEmailOtpMessage", () => {
  test("includes the sign-in code in both email formats", () => {
    const email = createEmailOtpMessage({ otp: "123456", type: "sign-in" });

    expect(email.subject).toBe("Your Threshold Lab sign-in code");
    expect(email.text).toContain("123456");
    expect(email.html).toContain("123456");
    expect(email.text).toContain("five minutes");
  });

  test("escapes unexpected markup in the HTML code", () => {
    const email = createEmailOtpMessage({
      otp: '12<34&"',
      type: "email-verification",
    });

    expect(email.html).toContain("12&lt;34&amp;&quot;");
    expect(email.html).not.toContain('12<34&"');
  });
});
