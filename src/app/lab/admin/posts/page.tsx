import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminBackLink } from "@/components/admin/admin-back-link";
import { AdminPostList } from "@/components/admin/admin-post-list";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { checkAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  description: "Create, edit, publish, and pin Threshold Lab posts.",
  title: "Lab Notes | Admin",
};

async function AdminPostsPageContent() {
  await checkAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink />
      <AdminPostList />
    </div>
  );
}

export default function AdminPostsPage() {
  return (
    <Suspense fallback={<LabRouteFallback />}>
      <AdminPostsPageContent />
    </Suspense>
  );
}
