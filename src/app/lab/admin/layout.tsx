import { Suspense } from "react";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAdmin } from "@/lib/auth";

async function AdminAccessGate({ children }: { children: React.ReactNode }) {
  await checkAdmin();

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 bg-background">
      {children}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <AdminAccessGate>{children}</AdminAccessGate>
    </Suspense>
  );
}
