import { describe, expect, test } from "bun:test";
import { getVerifyEmailPath } from "./routes";

describe("getVerifyEmailPath", () => {
  test("normalizes and encodes the email address", () => {
    expect(getVerifyEmailPath(" Athlete@Example.COM ")).toBe(
      "/verify-email?email=athlete%40example.com",
    );
  });
});
