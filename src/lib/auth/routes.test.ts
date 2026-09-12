import { describe, expect, test } from "bun:test";
import {
  getCheckoutReturnPath,
  getEmailOtpSuccessPath,
  getSafeAuthReturnPath,
  parseCheckoutOption,
} from "./routes";

describe("email OTP routing", () => {
  test("opens the subscription flow after signup", () => {
    expect(getEmailOtpSuccessPath("signup")).toBe("/subscribe");
  });

  test("opens Lab Notes after login", () => {
    expect(getEmailOtpSuccessPath("login")).toBe("/lab/lab-notes");
  });
});

describe("public catalog checkout routing", () => {
  test("preserves a block selection through either auth mode", () => {
    const next = getCheckoutReturnPath("block:block_123");
    expect(getSafeAuthReturnPath(next)).toBe(next);
    expect(getEmailOtpSuccessPath("signup", next)).toBe(next);
    expect(getEmailOtpSuccessPath("login", next)).toBe(next);
  });

  test("supports membership invitations and the bundle", () => {
    expect(getEmailOtpSuccessPath("login", "/subscribe")).toBe("/subscribe");
    expect(getSafeAuthReturnPath("/subscribe?purchase=bundle")).toBe(
      "/subscribe?purchase=bundle",
    );
    expect(parseCheckoutOption("membership")).toBe("membership");
  });

  test("rejects external redirects, unexpected routes, and malformed block IDs", () => {
    for (const next of [
      "https://example.com",
      "//example.com",
      "/lab/admin",
      "/subscribe/../admin",
      "/subscribe?purchase=block%3A..%2Fadmin",
      "/subscribe?purchase=invalid",
    ]) {
      expect(getSafeAuthReturnPath(next)).toBeNull();
      expect(getEmailOtpSuccessPath("signup", next)).toBe("/subscribe");
    }
  });
});
