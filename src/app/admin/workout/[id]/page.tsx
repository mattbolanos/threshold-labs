import type { Metadata } from "next";
import { AdminWorkoutForm } from "@/components/admin/admin-workout-form";
import { checkAuth } from "@/lib/auth";
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

export const metadata: Metadata = {
  description: "Edit workout",
  title: "Edit Workout",
};

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [, { id }, preloadedUserQuery] = await Promise.all([
    checkAuth(),
    params,
    preloadAuthQuery(api.auth.getCurrentUser),
  ]);

  return (
    <AdminWorkoutForm
      mode="edit"
      preloadedUserQuery={preloadedUserQuery}
      workoutId={id}
    />
  );
}
