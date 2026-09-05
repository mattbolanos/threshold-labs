export const DISCOUNT_CODE_TYPES = ["fifty_monthly", "free_forever"] as const;

export type DiscountCodeType = (typeof DISCOUNT_CODE_TYPES)[number];

export const FIFTY_MONTHLY_TARGET_AMOUNT = 5_000;

interface MembershipPrice {
  currency: string;
  id: string;
  interval: string | null;
  productId: string;
  unitAmount: number | null;
}

export interface DiscountCouponDefinition {
  amountOff?: number;
  couponId: string;
  currency?: string;
  name: string;
  percentOff?: number;
  productId: string;
}

interface DiscountCouponSnapshot {
  amountOff: number | null;
  currency: string | null;
  duration: string;
  percentOff: number | null;
  productIds: string[] | null;
  valid: boolean;
}

export function isDiscountCouponCompatible(
  definition: DiscountCouponDefinition,
  coupon: DiscountCouponSnapshot,
) {
  const productRestrictionMatches =
    coupon.productIds === null ||
    coupon.productIds.length === 0 ||
    coupon.productIds.includes(definition.productId);

  return (
    coupon.valid &&
    coupon.duration === "forever" &&
    productRestrictionMatches &&
    coupon.amountOff === (definition.amountOff ?? null) &&
    coupon.percentOff === (definition.percentOff ?? null) &&
    coupon.currency === (definition.currency ?? null)
  );
}

export function getDiscountCouponDefinition(
  discountType: DiscountCodeType,
  price: MembershipPrice,
): DiscountCouponDefinition {
  if (price.interval !== "month") {
    throw new Error("The Inside the Lab Stripe price must recur monthly.");
  }

  const couponSuffix = price.id.replaceAll(/[^a-zA-Z0-9_-]/g, "-");

  if (discountType === "free_forever") {
    return {
      couponId: `threshold-free-forever-${couponSuffix}`,
      name: "Free forever — Inside the Lab",
      percentOff: 100,
      productId: price.productId,
    };
  }

  if (price.currency.toLowerCase() !== "usd" || price.unitAmount === null) {
    throw new Error(
      "The $50/month discount requires a fixed USD membership price.",
    );
  }

  if (price.unitAmount <= FIFTY_MONTHLY_TARGET_AMOUNT) {
    throw new Error(
      "The membership price must be greater than $50 to issue a $50/month code.",
    );
  }

  return {
    amountOff: price.unitAmount - FIFTY_MONTHLY_TARGET_AMOUNT,
    couponId: `threshold-50-monthly-${couponSuffix}`,
    currency: "usd",
    name: "$50/month — Inside the Lab",
    productId: price.productId,
  };
}

export function getDiscountCodePrefix(discountType: DiscountCodeType) {
  return discountType === "free_forever" ? "TLFREE" : "TL50";
}
