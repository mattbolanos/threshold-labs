import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAnyLabAccess } from "@/lib/auth";

async function LabRedirect() {
  await checkAnyLabAccess();
  return redirect("/lab/lab-notes");
}

export default function LabPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <LabRedirect />
    </Suspense>
  );
}
