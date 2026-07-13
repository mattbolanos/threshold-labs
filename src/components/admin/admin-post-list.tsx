"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { IconEdit, IconEye, IconEyeOff, IconPlus } from "@tabler/icons-react";
import type { Preloaded } from "convex/react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import { PostMarkdown } from "@/components/posts/post-markdown";
import { PostMeta } from "@/components/posts/post-meta";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { api } from "../../../convex/_generated/api";
import { api as convexApi } from "../../../convex/_generated/api";

type AdminPostListProps = {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
};

export function AdminPostList({ preloadedUserQuery }: AdminPostListProps) {
  const user = usePreloadedAuthQuery(preloadedUserQuery);
  const posts = useQuery(convexApi.posts.getPostsForAdmin);
  const setPostVisibility = useMutation(convexApi.posts.setPostVisibility);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  const toggleVisibility = async (post: NonNullable<typeof posts>[number]) => {
    setErrorMessage(null);
    setPendingId(post._id);
    try {
      await setPostVisibility({
        isVisible: !post.isVisible,
        postId: post._id,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Visibility could not be updated.",
      );
    }
    setPendingId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Lab Notes</h1>
        </div>
        <Link className={buttonVariants()} href="/admin/posts/new">
          <IconPlus data-icon="inline-start" />
          New Post
        </Link>
      </header>

      {errorMessage ? (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {posts === undefined ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : null}

      {posts?.length === 0 ? (
        <Empty className="min-h-72 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconPlus aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No posts yet</EmptyTitle>
            <EmptyDescription>
              Create the first Lab Note and keep it hidden until it is ready.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link className={buttonVariants()} href="/admin/posts/new">
              Create Post
            </Link>
          </EmptyContent>
        </Empty>
      ) : null}

      {posts?.map((post) => (
        <Card key={post._id}>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
            <CardDescription>
              <PostMeta
                category={post.category}
                publishedAt={post.publishedAt}
              />
            </CardDescription>
            <CardAction>
              <Badge variant={post.isVisible ? "default" : "secondary"}>
                {post.isVisible ? "Visible" : "Hidden"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <PostMarkdown content={post.excerpt} variant="card" />
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              disabled={pendingId === post._id}
              onClick={() => void toggleVisibility(post)}
              variant="outline"
            >
              {post.isVisible ? (
                <IconEyeOff data-icon="inline-start" />
              ) : (
                <IconEye data-icon="inline-start" />
              )}
              {post.isVisible ? "Hide" : "Publish"}
            </Button>
            <Link
              className={buttonVariants()}
              href={`/admin/posts/${post._id}`}
            >
              <IconEdit data-icon="inline-start" />
              Edit
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
