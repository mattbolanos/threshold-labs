import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type PostMarkdownProps = {
  className?: string;
  content: string;
  title?: string;
  titleAs?: "h1" | "h2";
  variant?: "card" | "article";
};

function ResponsiveTable({ children, ...props }: ComponentProps<"table">) {
  return (
    <div className="typeset-scroll">
      <table {...props}>{children}</table>
    </div>
  );
}

export function PostMarkdown({
  className,
  content,
  title,
  titleAs = "h1",
  variant = "article",
}: PostMarkdownProps) {
  const Title = titleAs;

  return (
    <div
      className={cn(
        "typeset",
        variant === "card"
          ? "typeset-lab-note-card text-muted-foreground"
          : "typeset-lab-note",
        className,
      )}
    >
      {title ? <Title className="text-foreground">{title}</Title> : null}
      <ReactMarkdown
        components={{
          table: ({ node: _node, ...props }) => <ResponsiveTable {...props} />,
        }}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
