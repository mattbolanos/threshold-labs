import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminPostForm } from "@/components/admin/admin-post-form";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Edit a Lab Note.",
  title: "Edit Lab Note | Admin",
};

async function EditPostPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [, { id }] = await Promise.all([checkAdmin(), params]);

  return <AdminPostForm mode="edit" postId={id} />;
}

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <EditPostPageContent params={params} />
    </Suspense>
  );
}
