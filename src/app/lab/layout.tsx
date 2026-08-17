import { Suspense } from "react";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkLabAccess } from "@/lib/auth";

async function LabAccessGate({ children }: { children: React.ReactNode }) {
  await checkLabAccess();

  return children;
}

export default function LabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <LabAccessGate>{children}</LabAccessGate>
    </Suspense>
  );
}
