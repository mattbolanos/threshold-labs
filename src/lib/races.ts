export const RACE_TYPE_OPTIONS = [
  { label: "HYROX", value: "hyrox" },
  { label: "Run race", value: "run" },
  { label: "Other", value: "other" },
] as const;

export const HYROX_DIVISION_OPTIONS = [
  { label: "Pro Singles", value: "Pro Singles" },
  { label: "Pro Doubles", value: "Pro Doubles" },
  { label: "Mixed Doubles", value: "Mixed Doubles" },
  { label: "Elite 15 Singles", value: "Elite 15 Singles" },
  { label: "Elite 15 Doubles", value: "Elite 15 Doubles" },
] as const;

export type RaceEventType = (typeof RACE_TYPE_OPTIONS)[number]["value"];

export const getRaceTypeLabel = (eventType: RaceEventType) =>
  RACE_TYPE_OPTIONS.find(({ value }) => value === eventType)?.label ?? "Race";
