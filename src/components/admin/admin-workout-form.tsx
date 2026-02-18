"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import {
  IconArrowLeft,
  IconCheck,
  IconLoader2,
  IconPlus,
} from "@tabler/icons-react";
import type { Preloaded } from "convex/react";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { api } from "../../../convex/_generated/api";
import { api as convexApi } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { WorkoutEditorFields } from "./workout-editor-fields";
import {
  EMPTY_WORKOUT_FORM,
  toWorkoutFormState,
  validateWorkoutForm,
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

  const [form, setForm] = useState<WorkoutFormState>(EMPTY_WORKOUT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFieldChange = <K extends keyof WorkoutFormState>(
    field: K,
    value: WorkoutFormState[K],
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const validation = validateWorkoutForm(form);
    if (!validation.workout) {
      setErrorMessage(validation.errors[0] ?? "Please fix form errors.");
      return;
    }

    setIsSubmitting(true);
    try {
      await withMinimumDuration(createWorkout({ workout: validation.workout }));
      router.push("/admin");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create workout.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      {...fadeIn}
      className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-2 sm:px-4 md:gap-6"
    >
      <Link
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        href="/admin"
      >
        <IconArrowLeft aria-hidden className="size-4" />
        Back to Workouts
      </Link>

      {errorMessage ? (
        <div
          className="bg-destructive/10 text-destructive rounded-lg border border-destructive/30 px-4 py-3 text-sm"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <Card className="px-1 sm:px-2">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">New Workout</CardTitle>
          <CardDescription>Create a new workout record.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <WorkoutEditorFields
              form={form}
              idPrefix="create-workout"
              onChange={handleFieldChange}
            />

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
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EditWorkoutForm({ workoutId }: { workoutId: string }) {
  const router = useRouter();
  const updateWorkout = useMutation(convexApi.workouts.updateWorkout);

  const workout = useQuery(convexApi.workouts.getWorkoutById, {
    workoutId: workoutId as Id<"workouts">,
  });

  // Derive initial form from workout on first load, then track edits in state.
  // A ref tracks which workout ID was used to seed the form so we don't
  // re-initialize on every Convex reactive update.
  const initializedForRef = useRef<string | null>(null);
  const [form, setForm] = useState<WorkoutFormState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  // Seed form state once when workout first arrives
  if (workout && initializedForRef.current !== workoutId) {
    initializedForRef.current = workoutId;
    setForm(toWorkoutFormState(workout));
  }

  const handleFieldChange = <K extends keyof WorkoutFormState>(
    field: K,
    value: WorkoutFormState[K],
  ) => {
    setForm((previous) => {
      if (!previous) return previous;
      return { ...previous, [field]: value };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!workout || !form) return;

    const validation = validateWorkoutForm(form);
    if (!validation.workout) {
      setErrorMessage(validation.errors[0] ?? "Please fix form errors.");
      return;
    }

    setIsSubmitting(true);
    try {
      await withMinimumDuration(
        updateWorkout({
          workout: validation.workout,
          workoutId: workout._id,
        }),
      );
      setIsSubmitting(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update workout.",
      );
      setIsSubmitting(false);
    }
  };

  if (workout === undefined) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-2 sm:px-4 md:gap-6">
        <Link
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          href="/admin"
        >
          <IconArrowLeft aria-hidden className="size-4" />
          Back to Workouts
        </Link>
        <Card className="px-1 sm:px-2">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Loading…</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (workout === null) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-2 sm:px-4 md:gap-6">
        <Link
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          href="/admin"
        >
          <IconArrowLeft aria-hidden className="size-4" />
          Back to Workouts
        </Link>
        <Card className="px-1 sm:px-2">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Workout Not Found
            </CardTitle>
            <CardDescription>
              This workout doesn't exist or may have been deleted.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const activeForm = form ?? toWorkoutFormState(workout);

  return (
    <motion.div
      {...fadeIn}
      className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-2 sm:px-4 md:gap-6"
    >
      <Link
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
        href="/admin"
      >
        <IconArrowLeft aria-hidden className="size-4" />
        Back to Workouts
      </Link>

      {errorMessage ? (
        <div
          className="bg-destructive/10 text-destructive rounded-lg border border-destructive/30 px-4 py-3 text-sm"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <Card className="px-1 sm:px-2">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Edit Workout</CardTitle>
          <CardDescription>
            Update details for this workout entry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-2"
                htmlFor="edit-hidden"
              >
                <input
                  checked={activeForm.isHidden}
                  id="edit-hidden"
                  onChange={(event) =>
                    handleFieldChange("isHidden", event.target.checked)
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
              form={activeForm}
              idPrefix="edit-workout"
              onChange={handleFieldChange}
            />

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
                {showSaved ? (
                  <>
                    <IconCheck aria-hidden />
                    <span>Saved</span>
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
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
