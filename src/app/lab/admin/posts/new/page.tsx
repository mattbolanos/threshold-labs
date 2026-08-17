import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPostForm } from "@/components/admin/admin-post-form";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Create a Lab Note.",
  title: "New Lab Note | Admin",
};

async function NewPostPageContent() {
  await checkAdmin();

  return <AdminPostForm mode="create" />;
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <NewPostPageContent />
    </Suspense>
  );
}
