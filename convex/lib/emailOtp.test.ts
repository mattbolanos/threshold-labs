import { describe, expect, test } from "bun:test";
import { createEmailOtpMessage } from "./emailOtp";

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
