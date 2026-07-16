import { IconArrowLeft, IconFileText } from "@tabler/icons-react";
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
import { cn } from "@/lib/utils";

type PostDetailProps = {
  post: {
    category: string;
    content: string;
    publishedAt: number;
    title: string;
  } | null;
};

export function PostDetail({ post }: PostDetailProps) {
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
