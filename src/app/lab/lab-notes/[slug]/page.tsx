import type { Metadata } from "next";
import { cache, Suspense } from "react";
import { LabRouteFallback } from "@/components/lab-route-fallback";
import { PostDetail } from "@/components/posts/post-detail";
import { checkLabAccess } from "@/lib/auth";
import { fetchAuthQuery } from "@/lib/auth-server";
import { summarizeMarkdown } from "@/lib/posts";
import { api } from "../../../../../convex/_generated/api";

type LabNotePageProps = {
  params: Promise<{ slug: string }>;
};

const getPublishedPost = cache((slug: string) =>
  fetchAuthQuery(api.posts.getPublishedPostBySlug, { slug }),
);

export async function generateMetadata({
  params,
}: LabNotePageProps): Promise<Metadata> {
  await checkLabAccess();
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

async function LabNotePageContent({ params }: LabNotePageProps) {
  await checkLabAccess();

  const { slug } = await params;
  const post = await getPublishedPost(slug);

  return <PostDetail post={post} />;
}

export default function LabNotePage({ params }: LabNotePageProps) {
  return (
    <main className="mx-auto max-w-3xl">
      <Suspense fallback={<LabRouteFallback />}>
        <LabNotePageContent params={params} />
      </Suspense>
    </main>
  );
}
