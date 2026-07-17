import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { PostDetail } from "@/components/posts/post-detail";
import { api } from "../../../../convex/_generated/api";

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
  const post = await fetchQuery(api.posts.getPublishedPostBySlug, { slug });

  return (
    <main className="mx-auto max-w-3xl">
      <PostDetail post={post} />
    </main>
  );
}
