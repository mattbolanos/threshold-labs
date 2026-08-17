import { describe, expect, test } from "bun:test";
import { createVerificationEmail } from "./verificationEmail";

describe("createVerificationEmail", () => {
  test("includes the verification URL in both email formats", () => {
    const url =
      "https://threshold.example/api/auth/verify-email?token=abc&callbackURL=%2Fauth%2Fcontinue";
    const email = createVerificationEmail(url);

    expect(email.subject).toBe("Verify your Threshold Lab email");
    expect(email.text).toContain(url);
    expect(email.html).toContain(
      "https://threshold.example/api/auth/verify-email?token=abc&amp;callbackURL=%2Fauth%2Fcontinue",
    );
    expect(email.html).not.toContain(`href="${url}"`);
  });
});
