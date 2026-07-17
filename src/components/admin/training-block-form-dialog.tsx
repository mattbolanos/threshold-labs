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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { AdminDateRangePickerField } from "./admin-date-range-picker-field";
import {
  createEmptyTrainingBlockForm,
  type TrainingBlockFormState,
  toTrainingBlockFormState,
  validateTrainingBlockForm,
} from "./training-block-form-utils";

type TrainingBlockFormDialogProps = {
  block?: Doc<"trainingBlocks">;
};

export function TrainingBlockFormDialog({
  block,
}: TrainingBlockFormDialogProps) {
  const createTrainingBlock = useMutation(
    api.trainingBlocks.createTrainingBlock,
  );
  const updateTrainingBlock = useMutation(
    api.trainingBlocks.updateTrainingBlock,
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TrainingBlockFormState>(() =>
    block ? toTrainingBlockFormState(block) : createEmptyTrainingBlockForm(),
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof TrainingBlockFormState, string>>
  >({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(block);

  const setField = <K extends keyof TrainingBlockFormState>(
    field: K,
    value: TrainingBlockFormState[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setForm(
        block
          ? toTrainingBlockFormState(block)
          : createEmptyTrainingBlockForm(),
      );
      setErrors({});
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const validation = validateTrainingBlockForm(form);
    setErrors(validation.errors);
    if (!validation.block) return;

    setIsSaving(true);
    try {
      if (block) {
        await updateTrainingBlock({
          block: validation.block,
          blockId: block._id,
        });
      } else {
        await createTrainingBlock({ block: validation.block });
      }
      setOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The training block could not be saved.",
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
            aria-label={isEditing ? `Edit ${block?.title}` : undefined}
            size={isEditing ? "icon-sm" : "default"}
            variant={isEditing ? "ghost" : "default"}
          />
        }
      >
        {isEditing ? <IconEdit /> : <IconPlus data-icon="inline-start" />}
        {isEditing ? null : "Add block"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit training block" : "Add a training block"}
          </DialogTitle>
          <DialogDescription>
            Define the focus and dates shown beside Lab Notes.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field
              className="sm:col-span-2"
              data-invalid={Boolean(errors.title)}
            >
              <FieldLabel htmlFor="block-title">Title</FieldLabel>
              <Input
                aria-invalid={Boolean(errors.title)}
                id="block-title"
                onChange={(event) => setField("title", event.target.value)}
                placeholder="LT2 durability"
                required
                value={form.title}
              />
              <FieldError>{errors.title}</FieldError>
            </Field>

            <AdminDateRangePickerField
              className="sm:col-span-2"
              endDate={form.endDate}
              error={errors.startDate ?? errors.endDate}
              id="block-date-range"
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

            <Field
              className="sm:col-span-2"
              data-invalid={Boolean(errors.description)}
            >
              <FieldLabel htmlFor="block-description">
                Focus description
              </FieldLabel>
              <Textarea
                aria-invalid={Boolean(errors.description)}
                id="block-description"
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                placeholder="One long threshold exposure each week, aerobic work around it, and enough HYROX texture to keep stations from getting stale."
                required
                rows={5}
                value={form.description}
              />
              <FieldDescription>
                Keep this concise enough to scan in the Lab Notes sidebar.
              </FieldDescription>
              <FieldError>{errors.description}</FieldError>
            </Field>
          </FieldGroup>

          {errorMessage ? (
            <Alert variant="destructive">
              <AlertTitle>Training block could not be saved</AlertTitle>
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
              {isSaving ? "Saving…" : isEditing ? "Save changes" : "Add block"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
