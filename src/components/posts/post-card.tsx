import { IconArrowUpRight } from "@tabler/icons-react";
import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { summarizeMarkdown } from "@/lib/posts";
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
  const summary = summarizeMarkdown(post.excerpt);

  return (
    <Link
      className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      href={`/notes/${post.slug}`}
      prefetch
    >
      <Card
        className="cursor-pointer transition-colors group-hover:ring-primary/40"
        size="sm"
      >
        <CardHeader>
          <CardDescription>
            <PostMeta category={post.category} publishedAt={post.publishedAt} />
          </CardDescription>
          <CardTitle className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
            {post.title}
          </CardTitle>
          <CardAction className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary">
            <IconArrowUpRight aria-hidden />
          </CardAction>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p className="line-clamp-2 leading-relaxed">{summary}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
