import type { Metadata } from "next";
import { PostDetail } from "@/components/posts/post-detail";

export const metadata: Metadata = {
  description: "A training note from Threshold Lab.",
  title: "Lab Note | Threshold Lab",
};

export default async function LabNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-3xl">
      <PostDetail slug={slug} />
    </main>
  );
}
