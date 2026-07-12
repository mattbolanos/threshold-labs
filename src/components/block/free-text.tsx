import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FreeTextProps {
  text: string | null;
  title: string;
}

export function FreeText({ text, title }: FreeTextProps) {
  if (!text) return null;

  return (
    <div className="typeset typeset-docs max-w-[42em]">
      <h3>{title}</h3>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
