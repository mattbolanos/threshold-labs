"use client";

import { IconNotebook } from "@tabler/icons-react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../../convex/_generated/api";
import { PostCard } from "./post-card";

function PostCardSkeleton() {
  return (
    <Card aria-hidden>
      <CardHeader>
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}

export function LabNotesFeed() {
  const posts = useQuery(api.posts.getPublishedPosts);

  if (posts === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <span className="sr-only">Loading Lab Notes</span>
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Empty className="min-h-72 border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconNotebook aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No Lab Notes yet</EmptyTitle>
          <EmptyDescription>
            Published training decisions and observations will appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
