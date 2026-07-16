import { IconNotebook } from "@tabler/icons-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { Doc } from "../../../convex/_generated/dataModel";
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

export function LabNotesFeedSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <span className="sr-only">Loading Lab Notes</span>
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  );
}

type LabNotesFeedProps = {
  posts: Pick<
    Doc<"posts">,
    "_id" | "category" | "excerpt" | "publishedAt" | "slug" | "title"
  >[];
};

export function LabNotesFeed({ posts }: LabNotesFeedProps) {
  if (posts.length === 0) {
    return (
      <Empty className="min-h-64 border">
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
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
