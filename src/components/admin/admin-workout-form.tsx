"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import {
  IconArrowLeft,
  IconCheck,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import type { Preloaded } from "convex/react";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { api } from "../../../convex/_generated/api";
import { api as convexApi } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { WorkoutEditorFields } from "./workout-editor-fields";
import {
  EMPTY_WORKOUT_FORM,
  toWorkoutFormState,
  validateWorkoutForm,
  type Workout,
  type WorkoutFormState,
} from "./workout-form-utils";

type AdminWorkoutFormProps =
  | {
      mode: "create";
      preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
    }
  | {
      mode: "edit";
      preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
      workoutId: string;
    };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withMinimumDuration<T>(promise: Promise<T>, minimumMs = 350) {
  const startedAt = Date.now();
  try {
    return await promise;
  } finally {
    const elapsed = Date.now() - startedAt;
    if (elapsed < minimumMs) {
      await wait(minimumMs - elapsed);
    }
  }
}

const fadeIn = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 8 },
  transition: { duration: 0.2 },
};

export function AdminWorkoutForm(props: AdminWorkoutFormProps) {
  const user = usePreloadedAuthQuery(props.preloadedUserQuery);

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  if (props.mode === "create") {
    return <CreateWorkoutForm />;
  }

  return <EditWorkoutForm workoutId={props.workoutId} />;
}

function CreateWorkoutForm() {
  const router = useRouter();
  const createWorkout = useMutation(convexApi.workouts.createWorkout);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: EMPTY_WORKOUT_FORM,
    onSubmit: async ({ value }) => {
      setErrorMessage(null);

      const validation = validateWorkoutForm(value);
      if (!validation.workout) {
        setErrorMessage(validation.errors[0] ?? "Please fix form errors.");
        return;
      }

      try {
        await withMinimumDuration(
          createWorkout({ workout: validation.workout }),
        );
        router.push("/admin");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to create workout.",
        );
      }
    },
  });

  const handleCreateSubmit = async () => {
    await form.handleSubmit();
  };

  const setWorkoutField = <K extends keyof WorkoutFormState>(
    field: K,
    value: WorkoutFormState[K],
  ) => {
    form.setFieldValue(field as never, value as never);
  };

  return (
    <motion.div {...fadeIn} className="flex w-full flex-col gap-6">
      <div className="route-padding-x">
        <Link
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          href="/admin"
        >
          <IconArrowLeft aria-hidden className="size-4" />
          Back to Workouts
        </Link>
      </div>

      {errorMessage ? (
        <div
          className="route-padding-x bg-destructive/10 text-destructive border-destructive/30 rounded-lg border px-4 py-3 text-sm"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="route-padding-x flex items-end justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
            Admin
          </p>
          <h2 className="text-lg font-semibold tracking-tight">New Workout</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Create a new workout record.
          </p>
        </div>
      </div>

      <div className="route-padding-x border-primary/20 relative border-t pt-4">
        <div className="bg-primary/40 absolute top-0 left-5 h-0.5 w-16 md:left-8" />
        <form
          action={handleCreateSubmit}
          className="mx-auto max-w-4xl space-y-5"
        >
          <form.Subscribe selector={(state) => state.values}>
            {(values) => (
              <WorkoutEditorFields
                form={values}
                idPrefix="create-workout"
                onChange={setWorkoutField}
              />
            )}
          </form.Subscribe>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  className="min-h-11"
                  onClick={() => router.push("/admin")}
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  className="min-h-11 min-w-36"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader2 aria-hidden className="animate-spin" />
                      <span>Creating…</span>
                    </>
                  ) : (
                    <>
                      <IconPlus aria-hidden />
                      <span>Create Workout</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </div>
    </motion.div>
  );
}

function EditWorkoutForm({ workoutId }: { workoutId: string }) {
  const workout = useQuery(convexApi.workouts.getWorkoutById, {
    workoutId: workoutId as Id<"workouts">,
  });

  if (workout === undefined) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="route-padding-x">
          <Link
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
            href="/admin"
          >
            <IconArrowLeft aria-hidden className="size-4" />
            Back to Workouts
          </Link>
        </div>
        <div className="route-padding-x">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
            Admin
          </p>
          <h2 className="text-lg font-semibold tracking-tight">Loading…</h2>
        </div>
      </div>
    );
  }

  if (workout === null) {
    return (
      <div className="flex w-full flex-col gap-6">
        <div className="route-padding-x">
          <Link
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
            href="/admin"
          >
            <IconArrowLeft aria-hidden className="size-4" />
            Back to Workouts
          </Link>
        </div>
        <div className="route-padding-x">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
            Admin
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            Workout Not Found
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            This workout doesn't exist or may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  return <LoadedEditWorkoutForm key={workoutId} workout={workout} />;
}

function LoadedEditWorkoutForm({ workout }: { workout: Workout }) {
  const router = useRouter();
  const updateWorkout = useMutation(convexApi.workouts.updateWorkout);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const form = useForm({
    defaultValues: toWorkoutFormState(workout),
    onSubmit: async ({ value }) => {
      setErrorMessage(null);

      const validation = validateWorkoutForm(value);
      if (!validation.workout) {
        setErrorMessage(validation.errors[0] ?? "Please fix form errors.");
        return;
      }

      try {
        await withMinimumDuration(
          updateWorkout({
            workout: validation.workout,
            workoutId: workout._id,
          }),
        );
        setShowSaved(true);
        await wait(1000);
        router.push("/admin");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to update workout.",
        );
      }
    },
  });

  const handleEditSubmit = async () => {
    await form.handleSubmit();
  };

  const setWorkoutField = <K extends keyof WorkoutFormState>(
    field: K,
    value: WorkoutFormState[K],
  ) => {
    form.setFieldValue(field as never, value as never);
  };

  return (
    <motion.div {...fadeIn} className="flex w-full flex-col gap-6">
      <div className="route-padding-x">
        <Link
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          href="/admin"
        >
          <IconArrowLeft aria-hidden className="size-4" />
          Back to Workouts
        </Link>
      </div>

      {errorMessage ? (
        <div
          className="route-padding-x bg-destructive/10 text-destructive border-destructive/30 rounded-lg border px-4 py-3 text-sm"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="route-padding-x flex items-end justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-[0.15em] uppercase">
            Admin
          </p>
          <h2 className="text-lg font-semibold tracking-tight">Edit Workout</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Update details for this workout entry.
          </p>
        </div>
      </div>

      <div className="route-padding-x border-primary/20 relative border-t pt-4">
        <div className="bg-primary/40 absolute top-0 left-5 h-0.5 w-16 md:left-8" />
        <form action={handleEditSubmit} className="mx-auto max-w-4xl space-y-5">
          <form.Subscribe selector={(state) => state.values}>
            {(values) => (
              <>
                <div className="space-y-2">
                  <Label
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-2"
                    htmlFor="edit-hidden"
                  >
                    <input
                      checked={values.isHidden}
                      id="edit-hidden"
                      onChange={(event) =>
                        setWorkoutField("isHidden", event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span>Hidden Workout</span>
                  </Label>
                  <p className="text-muted-foreground text-xs">
                    Hidden workouts are excluded from all user-facing queries.
                  </p>
                </div>

                <WorkoutEditorFields
                  form={values}
                  idPrefix="edit-workout"
                  onChange={setWorkoutField}
                />
              </>
            )}
          </form.Subscribe>

          <form.Subscribe
            selector={(state) => ({
              isDirty: state.isDirty,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ isDirty, isSubmitting }) => (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  className="min-h-11"
                  onClick={() => router.push("/admin")}
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  className="min-h-11 min-w-36"
                  disabled={isSubmitting || !isDirty || showSaved}
                  type="submit"
                >
                  {showSaved ? (
                    <>
                      <IconCheck aria-hidden />
                      <span>Saved!</span>
                    </>
                  ) : isSubmitting ? (
                    <>
                      <IconLoader2 aria-hidden className="animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <IconCheck aria-hidden />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </div>
    </motion.div>
  );
}
