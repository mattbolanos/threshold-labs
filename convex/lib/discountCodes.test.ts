import { describe, expect, test } from "bun:test";
import {
  getDiscountCodePrefix,
  getDiscountCouponDefinition,
  isDiscountCouponCompatible,
} from "./discountCodes";

const monthlyPrice = {
  currency: "usd",
  id: "price_inside_lab",
  interval: "month",
  productId: "prod_inside_lab",
  unitAmount: 7_000,
};

describe("getDiscountCouponDefinition", () => {
  test("discounts the configured price to exactly $50/month", () => {
    expect(getDiscountCouponDefinition("fifty_monthly", monthlyPrice)).toEqual({
      amountOff: 2_000,
      couponId: "threshold-50-monthly-price_inside_lab",
      currency: "usd",
      name: "$50/month — Inside the Lab",
      productId: "prod_inside_lab",
    });
  });

  test("makes the free offer a full discount", () => {
    expect(getDiscountCouponDefinition("free_forever", monthlyPrice)).toEqual({
      couponId: "threshold-free-forever-price_inside_lab",
      name: "Free forever — Inside the Lab",
      percentOff: 100,
      productId: "prod_inside_lab",
    });
  });

  test("rejects incompatible prices", () => {
    expect(() =>
      getDiscountCouponDefinition("fifty_monthly", {
        ...monthlyPrice,
        currency: "eur",
      }),
    ).toThrow("fixed USD");
    expect(() =>
      getDiscountCouponDefinition("fifty_monthly", {
        ...monthlyPrice,
        unitAmount: 5_000,
      }),
    ).toThrow("greater than $50");
    expect(() =>
      getDiscountCouponDefinition("free_forever", {
        ...monthlyPrice,
        interval: "year",
      }),
    ).toThrow("recur monthly");
  });
});

test("discount code prefixes identify the offer without including user data", () => {
  expect(getDiscountCodePrefix("fifty_monthly")).toBe("TL50");
  expect(getDiscountCodePrefix("free_forever")).toBe("TLFREE");
});

describe("isDiscountCouponCompatible", () => {
  const definition = getDiscountCouponDefinition("fifty_monthly", monthlyPrice);
  const matchingCoupon = {
    amountOff: 2_000,
    currency: "usd",
    duration: "forever",
    percentOff: null,
    productIds: [monthlyPrice.productId],
    valid: true,
  };

  test("accepts Stripe omitting an eligible-product restriction", () => {
    expect(
      isDiscountCouponCompatible(definition, {
        ...matchingCoupon,
        productIds: null,
      }),
    ).toBe(true);
  });

  test("rejects a coupon restricted to a different product", () => {
    expect(
      isDiscountCouponCompatible(definition, {
        ...matchingCoupon,
        productIds: ["prod_other"],
      }),
    ).toBe(false);
  });

  test("rejects mismatched financial terms", () => {
    expect(
      isDiscountCouponCompatible(definition, {
        ...matchingCoupon,
        amountOff: 1_500,
      }),
    ).toBe(false);
  });
});
