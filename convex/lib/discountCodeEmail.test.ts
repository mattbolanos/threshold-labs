import { describe, expect, test } from "bun:test";
import {
  createDiscountCodeEmailMessage,
  normalizeDiscountCodeRecipient,
} from "./discountCodeEmail";

describe("normalizeDiscountCodeRecipient", () => {
  test("normalizes a valid recipient", () => {
    expect(normalizeDiscountCodeRecipient(" Member@Example.COM ")).toBe(
      "member@example.com",
    );
  });

  test("rejects malformed recipients", () => {
    expect(() => normalizeDiscountCodeRecipient("not-an-email")).toThrow(
      "valid recipient",
    );
  });
});

describe("createDiscountCodeEmailMessage", () => {
  test("describes the single-use free offer", () => {
    const message = createDiscountCodeEmailMessage({
      code: "TLFREE-ABC123",
      discountType: "free_forever",
      signupUrl: "https://example.com/signup",
    });

    expect(message.subject).toContain("free");
    expect(message.text).toContain("TLFREE-ABC123");
    expect(message.text).toContain("only be used once");
    expect(message.html).toContain("https://example.com/signup");
  });

  test("describes the $50 monthly offer", () => {
    const message = createDiscountCodeEmailMessage({
      code: "TL50-ABC123",
      discountType: "fifty_monthly",
      signupUrl: "https://example.com/signup",
    });

    expect(message.subject).toContain("$50/month");
    expect(message.text).toContain("$50 per month");
  });
});
