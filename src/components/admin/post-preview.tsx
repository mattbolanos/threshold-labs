import { PostMarkdown } from "@/components/posts/post-markdown";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

type PostPreviewProps = {
  content: string;
};

export function PostPreview({ content }: PostPreviewProps) {
  if (!content.trim()) {
    return (
      <Empty className="min-h-96">
        <EmptyHeader>
          <EmptyTitle>Nothing to preview</EmptyTitle>
          <EmptyDescription>
            Add Markdown in the Edit tab to see the rendered post.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="min-h-96">
      <PostMarkdown content={content} />
    </div>
  );
}
