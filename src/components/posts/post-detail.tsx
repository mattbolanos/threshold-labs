"use client";

import { IconArrowLeft, IconFileText } from "@tabler/icons-react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { PostMarkdown } from "@/components/posts/post-markdown";
import { PostMeta } from "@/components/posts/post-meta";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";

export function PostDetail({ slug }: { slug: string }) {
  const post = useQuery(api.posts.getPublishedPostBySlug, { slug });

  if (post === undefined) {
    return (
      <div className="flex flex-col gap-6">
        <span className="sr-only">Loading post</span>
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (post === null) {
    return (
      <Empty className="min-h-80 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconFileText aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Post not found</EmptyTitle>
          <EmptyDescription>
            This note is unavailable or has not been published.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link className={buttonVariants()} href="/">
            View Lab Notes
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <article className="flex flex-col gap-6">
      <Link
        className={cn(
          buttonVariants({
            className: "w-fit px-0",
            variant: "link",
          }),
          "pl-0!",
        )}
        href="/"
      >
        <IconArrowLeft data-icon="inline-start" />
        Lab Notes
      </Link>
      <PostMeta category={post.category} publishedAt={post.publishedAt} />
      <Separator />
      <PostMarkdown content={post.content} title={post.title} />
    </article>
  );
}
