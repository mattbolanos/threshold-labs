import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { cache } from "react";
import { PostDetail } from "@/components/posts/post-detail";
import { checkAuth } from "@/lib/auth";
import { summarizeMarkdown } from "@/lib/posts";
import { api } from "../../../../../convex/_generated/api";

type LabNotePageProps = {
  params: Promise<{ slug: string }>;
};

const getPublishedPost = cache((slug: string) =>
  fetchQuery(api.posts.getPublishedPostBySlug, { slug }),
);

export async function generateMetadata({
  params,
}: LabNotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (post === null) {
    return {
      description: "This Lab Note is unavailable or has not been published.",
      title: "Lab Note not found | Threshold Lab",
    };
  }

  return {
    description: summarizeMarkdown(post.excerpt),
    title: `${post.title} | Threshold Lab`,
  };
}

export default async function LabNotePage({ params }: LabNotePageProps) {
  await checkAuth();

  const { slug } = await params;
  const post = await getPublishedPost(slug);

  return (
    <main className="mx-auto max-w-3xl">
      <PostDetail post={post} />
    </main>
  );
}
