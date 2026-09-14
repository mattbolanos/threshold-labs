import { Suspense } from "react";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAuthenticated } from "@/lib/auth";

async function LabAuthenticationGate({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAuthenticated();

  return children;
}

export default function LabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <LabAuthenticationGate>{children}</LabAuthenticationGate>
    </Suspense>
  );
}
