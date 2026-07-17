"use client";

import { IconEdit, IconLoader2, IconPlus } from "@tabler/icons-react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HYROX_DIVISION_OPTIONS,
  RACE_TYPE_OPTIONS,
  type RaceEventType,
} from "@/lib/races";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { AdminDateRangePickerField } from "./admin-date-range-picker-field";
import {
  createEmptyRaceForm,
  type RaceFormState,
  toRaceFormState,
  validateRaceForm,
} from "./race-form-utils";

type RaceFormDialogProps = {
  race?: Doc<"races">;
};

export function RaceFormDialog({ race }: RaceFormDialogProps) {
  const createRace = useMutation(api.races.createRace);
  const updateRace = useMutation(api.races.updateRace);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RaceFormState>(() =>
    race ? toRaceFormState(race) : createEmptyRaceForm(),
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof RaceFormState, string>>
  >({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(race);

  const setField = <K extends keyof RaceFormState>(
    field: K,
    value: RaceFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setForm(race ? toRaceFormState(race) : createEmptyRaceForm());
      setErrors({});
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const validation = validateRaceForm(form);
    setErrors(validation.errors);
    if (!validation.race) return;

    setIsSaving(true);
    try {
      if (race) {
        await updateRace({ race: validation.race, raceId: race._id });
      } else {
        await createRace({ race: validation.race });
      }
      setOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "The race could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger
        render={
          <Button
            aria-label={isEditing ? `Edit ${race?.name}` : undefined}
            size={isEditing ? "icon-sm" : "default"}
            variant={isEditing ? "ghost" : "default"}
          />
        }
      >
        {isEditing ? <IconEdit /> : <IconPlus data-icon="inline-start" />}
        {isEditing ? null : "Add race"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit race" : "Add a race"}</DialogTitle>
          <DialogDescription>
            Add HYROX, Elite 15, running, or one-off events manually.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field
              className="sm:col-span-2"
              data-invalid={Boolean(errors.name)}
            >
              <FieldLabel htmlFor="race-name">Race name</FieldLabel>
              <Input
                aria-invalid={Boolean(errors.name)}
                id="race-name"
                onChange={(event) => setField("name", event.target.value)}
                placeholder="HYROX Washington DC"
                required
                value={form.name}
              />
              <FieldError>{errors.name}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="race-type">Event type</FieldLabel>
              <Select
                items={RACE_TYPE_OPTIONS}
                onValueChange={(value) =>
                  setField("eventType", value as RaceEventType)
                }
                value={form.eventType}
              >
                <SelectTrigger className="w-full" id="race-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {RACE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {form.eventType === "hyrox" ? (
              <Field data-invalid={Boolean(errors.division)}>
                <FieldLabel htmlFor="race-division">Division</FieldLabel>
                <Select
                  items={HYROX_DIVISION_OPTIONS}
                  onValueChange={(value) => setField("division", value ?? "")}
                  value={form.division}
                >
                  <SelectTrigger
                    aria-invalid={Boolean(errors.division)}
                    className="w-full"
                    id="race-division"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {HYROX_DIVISION_OPTIONS.map((division) => (
                        <SelectItem key={division.value} value={division.value}>
                          {division.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.division}</FieldError>
              </Field>
            ) : (
              <Field>
                <FieldLabel htmlFor="race-location">Location</FieldLabel>
                <Input
                  id="race-location"
                  onChange={(event) => setField("location", event.target.value)}
                  placeholder="Brooklyn, NY"
                  value={form.location}
                />
              </Field>
            )}

            {form.eventType === "hyrox" ? (
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="race-location">Location</FieldLabel>
                <Input
                  id="race-location"
                  onChange={(event) => setField("location", event.target.value)}
                  placeholder="Washington, DC"
                  value={form.location}
                />
              </Field>
            ) : null}

            <AdminDateRangePickerField
              className="sm:col-span-2"
              endDate={form.endDate}
              error={errors.startDate ?? errors.endDate}
              id="race-date-range"
              label="Date range"
              onValueChange={(range) => {
                setForm((current) => ({ ...current, ...range }));
                setErrors((current) => ({
                  ...current,
                  endDate: undefined,
                  startDate: undefined,
                }));
              }}
              startDate={form.startDate}
            />
          </FieldGroup>

          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Race could not be saved</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <DialogClose
              render={
                <Button disabled={isSaving} type="button" variant="outline" />
              }
            >
              Cancel
            </DialogClose>
            <Button disabled={isSaving} type="submit">
              {isSaving ? (
                <IconLoader2
                  className="animate-spin"
                  data-icon="inline-start"
                />
              ) : null}
              {isSaving ? "Saving…" : isEditing ? "Save changes" : "Add race"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
