/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as discountCodes from "../discountCodes.js";
import type * as emailOtp from "../emailOtp.js";
import type * as emailOtpRateLimit from "../emailOtpRateLimit.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as lib_authEnvironment from "../lib/authEnvironment.js";
import type * as lib_discountCheckout from "../lib/discountCheckout.js";
import type * as lib_discountCodeEmail from "../lib/discountCodeEmail.js";
import type * as lib_discountCodes from "../lib/discountCodes.js";
import type * as lib_emailOtp from "../lib/emailOtp.js";
import type * as lib_labAccess from "../lib/labAccess.js";
import type * as lib_membershipAccess from "../lib/membershipAccess.js";
import type * as lib_stripeAuth from "../lib/stripeAuth.js";
import type * as lib_stripeCustomer from "../lib/stripeCustomer.js";
import type * as lib_trainingBlockPurchases from "../lib/trainingBlockPurchases.js";
import type * as lib_trainingBlockStripe from "../lib/trainingBlockStripe.js";
import type * as lib_workoutAccess from "../lib/workoutAccess.js";
import type * as postSorting from "../postSorting.js";
import type * as posts from "../posts.js";
import type * as previewAuth from "../previewAuth.js";
import type * as raceSync from "../raceSync.js";
import type * as races from "../races.js";
import type * as subscriptionAccess from "../subscriptionAccess.js";
import type * as trainingBlockDates from "../trainingBlockDates.js";
import type * as trainingBlockPurchases from "../trainingBlockPurchases.js";
import type * as trainingBlocks from "../trainingBlocks.js";
import type * as workouts from "../workouts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  billing: typeof billing;
  discountCodes: typeof discountCodes;
  emailOtp: typeof emailOtp;
  emailOtpRateLimit: typeof emailOtpRateLimit;
  emails: typeof emails;
  http: typeof http;
  "lib/authEnvironment": typeof lib_authEnvironment;
  "lib/discountCheckout": typeof lib_discountCheckout;
  "lib/discountCodeEmail": typeof lib_discountCodeEmail;
  "lib/discountCodes": typeof lib_discountCodes;
  "lib/emailOtp": typeof lib_emailOtp;
  "lib/labAccess": typeof lib_labAccess;
  "lib/membershipAccess": typeof lib_membershipAccess;
  "lib/stripeAuth": typeof lib_stripeAuth;
  "lib/stripeCustomer": typeof lib_stripeCustomer;
  "lib/trainingBlockPurchases": typeof lib_trainingBlockPurchases;
  "lib/trainingBlockStripe": typeof lib_trainingBlockStripe;
  "lib/workoutAccess": typeof lib_workoutAccess;
  postSorting: typeof postSorting;
  posts: typeof posts;
  previewAuth: typeof previewAuth;
  raceSync: typeof raceSync;
  races: typeof races;
  subscriptionAccess: typeof subscriptionAccess;
  trainingBlockDates: typeof trainingBlockDates;
  trainingBlockPurchases: typeof trainingBlockPurchases;
  trainingBlocks: typeof trainingBlocks;
  workouts: typeof workouts;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
};
