import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminWorkoutForm } from "@/components/admin/admin-workout-form";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Edit workout",
  title: "Edit Workout",
};

async function EditWorkoutPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [, { id }] = await Promise.all([checkAdmin(), params]);

  return <AdminWorkoutForm mode="edit" workoutId={id} />;
}

export default function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <EditWorkoutPageContent params={params} />
    </Suspense>
  );
}
