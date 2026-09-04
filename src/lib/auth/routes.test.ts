import { describe, expect, test } from "bun:test";
import { getEmailOtpSuccessPath } from "./routes";

describe("email OTP routing", () => {
  test("opens the subscription flow after signup", () => {
    expect(getEmailOtpSuccessPath("signup")).toBe("/subscribe");
  });

  test("opens Lab Notes after login", () => {
    expect(getEmailOtpSuccessPath("login")).toBe("/lab/lab-notes");
  });
});
