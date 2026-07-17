import { formatPostDate } from "@/lib/posts";

type PostMetaProps = {
  category: string;
  publishedAt: number;
};

export function PostMeta({ category, publishedAt }: PostMetaProps) {
  return (
    <p className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs font-medium">
      <time dateTime={new Date(publishedAt).toISOString()}>
        {formatPostDate(publishedAt)}
      </time>
      <span aria-hidden>·</span>
      <span>{category}</span>
    </p>
  );
}
