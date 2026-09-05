import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkLabAccess } from "@/lib/auth";

async function LabRedirect() {
  await checkLabAccess();
  return redirect("/lab/lab-notes");
}

export default function LabPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <LabRedirect />
    </Suspense>
  );
}
