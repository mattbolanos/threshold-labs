import type { Metadata } from "next";
import { AdminWorkoutForm } from "@/components/admin/admin-workout-form";
import { checkAuth } from "@/lib/auth";
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

export const metadata: Metadata = {
  description: "Create a new workout",
  title: "New Workout",
};

export default async function NewWorkoutPage() {
  "use no memo";
  await checkAuth();
  const preloadedUserQuery = await preloadAuthQuery(api.auth.getCurrentUser);

  return (
    <AdminWorkoutForm mode="create" preloadedUserQuery={preloadedUserQuery} />
  );
}
