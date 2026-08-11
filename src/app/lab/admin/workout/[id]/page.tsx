import type { Metadata } from "next";
import { AdminWorkoutForm } from "@/components/admin/admin-workout-form";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Edit workout",
  title: "Edit Workout",
};

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [, { id }] = await Promise.all([checkAdmin(), params]);

  return <AdminWorkoutForm mode="edit" workoutId={id} />;
}
