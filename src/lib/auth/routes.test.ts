import { describe, expect, test } from "bun:test";
import { EMAIL_OTP_SUCCESS_PATH } from "./routes";

describe("email OTP routing", () => {
  test("opens Lab Notes after verification", () => {
    expect(EMAIL_OTP_SUCCESS_PATH).toBe("/lab/lab-notes");
  });
});
