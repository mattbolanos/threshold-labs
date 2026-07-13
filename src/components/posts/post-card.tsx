import { IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { PostMarkdown } from "./post-markdown";
import { PostMeta } from "./post-meta";

type PostCardProps = {
  post: {
    category: string;
    excerpt: string;
    publishedAt: number;
    slug: string;
    title: string;
  };
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="transition-colors hover:ring-primary/40">
      <CardHeader>
        <CardDescription>
          <PostMeta category={post.category} publishedAt={post.publishedAt} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PostMarkdown
          content={post.excerpt}
          title={post.title}
          titleAs="h2"
          variant="card"
        />
      </CardContent>
      <CardFooter className="bg-transparent">
        <Link
          className={buttonVariants({
            className: "px-0",
            variant: "link",
          })}
          href={`/notes/${post.slug}`}
        >
          Expand
          <IconArrowUpRight data-icon="inline-end" />
        </Link>
      </CardFooter>
    </Card>
  );
}
