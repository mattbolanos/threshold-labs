import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAnyLabAccess } from "@/lib/auth";

async function LabRedirect() {
  const access = await checkAnyLabAccess();
  return redirect(
    access.hasFullAccess ? "/lab/lab-notes" : "/lab/training/workouts",
  );
}

export default function LabPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <LabRedirect />
    </Suspense>
  );
}
