import type { Doc } from "../../../convex/_generated/dataModel";

export type TrainingBlockFormState = {
  description: string;
  endDate: string;
  startDate: string;
  title: string;
};

export type TrainingBlockFormErrors = Partial<
  Record<keyof TrainingBlockFormState, string>
>;

export const createEmptyTrainingBlockForm = (): TrainingBlockFormState => ({
  description: "",
  endDate: "",
  startDate: "",
  title: "",
});

export const toTrainingBlockFormState = (
  block: Doc<"trainingBlocks">,
): TrainingBlockFormState => ({
  description: block.description,
  endDate: block.endDate,
  startDate: block.startDate,
  title: block.title,
});

export const validateTrainingBlockForm = (form: TrainingBlockFormState) => {
  const errors: TrainingBlockFormErrors = {};
  const title = form.title.trim();
  const description = form.description.trim();

  if (!title) errors.title = "Add a block title.";
  if (!description) errors.description = "Describe the focus for this block.";
  if (!form.startDate) errors.startDate = "Choose a start date.";
  if (!form.endDate) errors.endDate = "Choose an end date.";
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = "End date must be on or after the start date.";
  }

  if (Object.keys(errors).length > 0) return { block: null, errors };

  return {
    block: {
      description,
      endDate: form.endDate,
      startDate: form.startDate,
      title,
    },
    errors,
  };
};
