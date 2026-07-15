import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
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
    <Link
      className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      href={`/notes/${post.slug}`}
      prefetch
    >
      <Card className="h-full cursor-pointer transition-colors hover:ring-primary/40">
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
      </Card>
    </Link>
  );
}
