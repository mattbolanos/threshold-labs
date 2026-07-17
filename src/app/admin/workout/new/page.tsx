import type { Metadata } from "next";
import { AdminWorkoutForm } from "@/components/admin/admin-workout-form";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Create a new workout",
  title: "New Workout",
};

export default async function NewWorkoutPage() {
  await checkAdmin();

  return <AdminWorkoutForm mode="create" />;
}
