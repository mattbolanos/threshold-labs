import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { formatLabDate, subtractCalendarDays } from "./workoutAccess";

type TransitionOffer = Pick<
  Doc<"discountCodes">,
  | "availableAt"
  | "complimentaryAccessExpired"
  | "discountType"
  | "recipientEmail"
  | "status"
>;

/** Midnight after the invitation day, accounting for Eastern daylight saving. */
export function getTransitionAccessEnd(availableAt: number) {
  const nextDay = subtractCalendarDays(
    formatLabDate(new Date(availableAt)),
    -1,
  );
  const daylightMidnight = Date.parse(`${nextDay}T04:00:00.000Z`);
  return formatLabDate(new Date(daylightMidnight)) === nextDay
    ? daylightMidnight
    : daylightMidnight + 3_600_000;
}

export function isDiscountOfferAvailable(
  offer: Pick<TransitionOffer, "availableAt" | "status">,
  now = Date.now(),
) {
  return (
    offer.status === "active" &&
    (offer.availableAt === undefined || offer.availableAt <= now)
  );
}

export function getComplimentaryAccessThrough(
  offers: TransitionOffer[],
  now = Date.now(),
) {
  const today = formatLabDate(new Date(now));
  return offers.reduce<string | null>((latest, offer) => {
    if (
      offer.complimentaryAccessExpired ||
      offer.status !== "active" ||
      offer.discountType !== "fifty_monthly" ||
      !offer.recipientEmail ||
      !offer.availableAt
    )
      return latest;
    const through = formatLabDate(new Date(offer.availableAt));
    return through >= today && (!latest || through > latest) ? through : latest;
  }, null);
}

export async function getMemberTransitionAccess(
  ctx: QueryCtx | MutationCtx,
  email: string,
) {
  const offers = await ctx.db
    .query("discountCodes")
    .withIndex("by_recipient_email", (q) =>
      q.eq("recipientEmail", email.trim().toLowerCase()),
    )
    .collect();
  return getComplimentaryAccessThrough(offers);
}

export function validateTransitionDate(
  {
    availableAt,
    discountType,
    recipientEmail,
  }: {
    availableAt: number;
    discountType: string;
    recipientEmail?: string;
  },
  now = Date.now(),
) {
  if (discountType !== "fifty_monthly" || !recipientEmail) {
    throw new Error(
      "Member transitions require an email address and the $50/month offer.",
    );
  }
  if (
    !Number.isFinite(availableAt) ||
    availableAt <= now ||
    availableAt > now + 366 * 86_400_000
  ) {
    throw new Error("Choose a future invitation date within the next year.");
  }
}
