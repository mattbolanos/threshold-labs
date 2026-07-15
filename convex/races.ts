import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import {
  type ActionCtx,
  action,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { authComponent } from "./auth";
import { isPreviewAuthEnabled } from "./previewAuth";

const HYROX_LAB_CALENDAR_URL = "https://hyroxlab.com/calendar";
const EVENT_SCRIPT_PATTERN =
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;

const normalizeKeyPart = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getExternalKey = ({
  country,
  locality,
  officialUrl,
  startDate,
}: {
  country: string;
  locality: string;
  officialUrl?: string;
  startDate: string;
}) => {
  if (officialUrl) {
    try {
      const path = new URL(officialUrl).pathname.replace(/\/+$/, "");
      if (path.startsWith("/event/")) {
        return `hyrox:${path}:${startDate.slice(0, 4)}`;
      }
    } catch {
      // Fall through to the stable location/date key.
    }
  }

  return ["hyrox-lab", country, locality, startDate]
    .map(normalizeKeyPart)
    .join(":");
};

const parseRace = (value: unknown, syncedAt: number) => {
  if (!isObject(value) || value["@type"] !== "Event") {
    return null;
  }

  const location = isObject(value.location) ? value.location : undefined;
  const address =
    location && isObject(location.address) ? location.address : undefined;
  const name = getString(value.name);
  const startDate = getString(value.startDate);
  const endDate = getString(value.endDate) ?? startDate;
  const locality = getString(address?.addressLocality);
  const country = getString(address?.addressCountry);
  const venueName = getString(location?.name) ?? locality;
  const officialUrl = getString(value.url);

  if (
    !name ||
    !startDate ||
    !endDate ||
    !DATE_PATTERN.test(startDate) ||
    !DATE_PATTERN.test(endDate) ||
    !locality ||
    !country ||
    !venueName
  ) {
    return null;
  }

  return {
    country,
    endDate,
    externalKey: getExternalKey({
      country,
      locality,
      officialUrl,
      startDate,
    }),
    locality,
    name,
    officialUrl,
    source: "hyrox-lab" as const,
    sourceUrl: HYROX_LAB_CALENDAR_URL,
    startDate,
    syncedAt,
    venueName,
  };
};

const parseCalendar = (html: string, syncedAt: number) => {
  const races = new Map<string, NonNullable<ReturnType<typeof parseRace>>>();

  for (const match of html.matchAll(EVENT_SCRIPT_PATTERN)) {
    try {
      const decoded: unknown = JSON.parse(match[1]);
      const values = Array.isArray(decoded) ? decoded : [decoded];

      for (const value of values) {
        const race = parseRace(value, syncedAt);
        if (race) {
          races.set(race.externalKey, race);
        }
      }
    } catch {
      // Ignore unrelated or malformed JSON-LD blocks.
    }
  }

  return Array.from(races.values());
};

type SyncResult = {
  added: number;
  syncedAt: number;
  total: number;
  updated: number;
};

const assertAdmin = async (ctx: QueryCtx | MutationCtx | ActionCtx) => {
  if (isPreviewAuthEnabled()) {
    return;
  }

  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user || user.role !== "admin") {
    throw new ConvexError("Only admins can manage HYROX races.");
  }
};

export const syncHyroxLabRaces = action({
  args: {},
  handler: async (ctx): Promise<SyncResult> => {
    await assertAdmin(ctx);
    const response = await fetch(HYROX_LAB_CALENDAR_URL, {
      headers: { Accept: "text/html" },
    });

    if (!response.ok) {
      throw new ConvexError(
        `HYROX Lab returned ${response.status} while refreshing races.`,
      );
    }

    const syncedAt = Date.now();
    const races = parseCalendar(await response.text(), syncedAt);
    if (races.length === 0) {
      throw new ConvexError("No HYROX races were found in the calendar feed.");
    }

    const result: Pick<SyncResult, "added" | "updated"> = await ctx.runMutation(
      internal.raceSync.upsertRaceCatalog,
      { races },
    );

    return { ...result, syncedAt, total: races.length };
  },
});

export const getRacesForAdmin = query({
  args: { fromDate: v.string() },
  handler: async (ctx, { fromDate }) => {
    await assertAdmin(ctx);
    const [races, plannedRaces] = await Promise.all([
      ctx.db
        .query("hyroxRaces")
        .withIndex("by_start_date", (q) => q.gte("startDate", fromDate))
        .order("asc")
        .collect(),
      ctx.db.query("plannedHyroxRaces").collect(),
    ]);
    const plannedIds = new Set(plannedRaces.map(({ raceId }) => raceId));

    return races.map((race) => ({
      ...race,
      isPlanned: plannedIds.has(race._id),
    }));
  },
});

export const setRacePlanned = mutation({
  args: {
    isPlanned: v.boolean(),
    raceId: v.id("hyroxRaces"),
  },
  handler: async (ctx, { isPlanned, raceId }) => {
    await assertAdmin(ctx);
    const race = await ctx.db.get(raceId);
    if (!race) {
      throw new ConvexError("HYROX race not found.");
    }

    const existing = await ctx.db
      .query("plannedHyroxRaces")
      .withIndex("by_race_id", (q) => q.eq("raceId", raceId))
      .first();

    if (isPlanned && !existing) {
      return await ctx.db.insert("plannedHyroxRaces", {
        plannedAt: Date.now(),
        raceId,
      });
    }
    if (!isPlanned && existing) {
      await ctx.db.delete(existing._id);
    }

    return existing?._id ?? null;
  },
});

export const getPlannedRaces = query({
  args: { fromDate: v.string() },
  handler: async (ctx, { fromDate }) => {
    const plannedRaces = await ctx.db.query("plannedHyroxRaces").collect();
    const races = await Promise.all(
      plannedRaces.map(({ raceId }) => ctx.db.get(raceId)),
    );

    const upcomingRaces = races.filter(
      (race): race is NonNullable<typeof race> =>
        race !== null && race.endDate >= fromDate,
    );

    return upcomingRaces.sort((a, b) => a.startDate.localeCompare(b.startDate));
  },
});
