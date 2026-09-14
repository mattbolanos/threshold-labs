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
  test("describes the free offer as a single confirmation step", () => {
    const message = createDiscountCodeEmailMessage({
      code: "TLFREE-ABC123",
      discountType: "free_forever",
      recipientEmail: "member@example.com",
      signupUrl: "https://example.com/signup",
    });

    expect(message.subject).toContain("free");
    expect(message.text).toContain("TLFREE-ABC123");
    expect(message.text).toContain("no card needed");
    expect(message.text).toContain("Every workout, past and present");
    expect(message.html).toContain("https://example.com/signup");
  });

  test("describes the $50 monthly offer", () => {
    const message = createDiscountCodeEmailMessage({
      code: "TL50-ABC123",
      discountType: "fifty_monthly",
      recipientEmail: "member@example.com",
      signupUrl: "https://example.com/signup",
    });

    expect(message.subject).toContain("$50/month");
    expect(message.text).toContain("$50/month for life");
    expect(message.text).toContain("Every workout, past and present");
  });

  test("ties the offer to the recipient instead of a typed code", () => {
    const message = createDiscountCodeEmailMessage({
      code: "TL50-ABC123",
      discountType: "fifty_monthly",
      recipientEmail: "member@example.com",
      signupUrl: "https://example.com/signup",
    });

    expect(message.text).toContain("tied to member@example.com");
    expect(message.text).toContain("offer already applied");
    expect(message.text).not.toContain("enter this code");
    expect(message.html).toContain("<strong>member@example.com</strong>");
  });
});
