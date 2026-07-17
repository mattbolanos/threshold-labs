import type { RefObject } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { PostMarkdownToolbar } from "./post-markdown-toolbar";

type PostContentEditorProps = {
  error?: string;
  onChange: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
};

export function PostContentEditor({
  error,
  onChange,
  textareaRef,
  value,
}: PostContentEditorProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel className="sr-only" htmlFor="post-content">
        Post content
      </FieldLabel>
      <PostMarkdownToolbar
        onChange={onChange}
        textareaRef={textareaRef}
        value={value}
      />
      <Textarea
        aria-invalid={Boolean(error)}
        className="min-h-96 font-mono"
        id="post-content"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write in Markdown, or insert a block above."
        ref={textareaRef}
        required
        value={value}
      />
      <FieldDescription>
        Headings, paragraphs, lists, quotes, code, links, and tables render
        through Typeset.
      </FieldDescription>
      <FieldError>{error}</FieldError>
    </Field>
  );
}
