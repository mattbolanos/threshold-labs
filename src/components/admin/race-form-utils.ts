import type { RaceEventType } from "@/lib/races";
import type { Doc } from "../../../convex/_generated/dataModel";

export type RaceFormState = {
  division: string;
  endDate: string;
  eventType: RaceEventType;
  location: string;
  name: string;
  startDate: string;
};

export type RaceFormErrors = Partial<Record<keyof RaceFormState, string>>;

export const createEmptyRaceForm = (): RaceFormState => ({
  division: "Pro Singles",
  endDate: "",
  eventType: "hyrox",
  location: "",
  name: "",
  startDate: "",
});

export const toRaceFormState = (race: Doc<"races">): RaceFormState => ({
  division: race.division ?? "Pro Singles",
  endDate: race.endDate,
  eventType: race.eventType,
  location: race.location ?? "",
  name: race.name,
  startDate: race.startDate,
});

export const validateRaceForm = (form: RaceFormState) => {
  const errors: RaceFormErrors = {};
  const name = form.name.trim();
  const location = form.location.trim();

  if (!name) errors.name = "Add a race name.";
  if (!form.startDate) errors.startDate = "Choose a start date.";
  if (!form.endDate) errors.endDate = "Choose an end date.";
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = "End date must be on or after the start date.";
  }
  if (form.eventType === "hyrox" && !form.division) {
    errors.division = "Choose a HYROX division.";
  }

  if (Object.keys(errors).length > 0) return { errors, race: null };

  return {
    errors,
    race: {
      division: form.eventType === "hyrox" ? form.division : null,
      endDate: form.endDate,
      eventType: form.eventType,
      location: location || null,
      name,
      startDate: form.startDate,
    },
  };
};
