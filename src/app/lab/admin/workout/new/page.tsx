import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminWorkoutForm } from "@/components/admin/admin-workout-form";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Create a new workout",
  title: "New Workout",
};

async function NewWorkoutPageContent() {
  await checkAdmin();

  return <AdminWorkoutForm mode="create" />;
}

export default function NewWorkoutPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <NewWorkoutPageContent />
    </Suspense>
  );
}
