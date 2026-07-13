import type { RefObject } from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { PostFormErrors, PostFormState } from "./post-form-utils";
import { PostMarkdownToolbar } from "./post-markdown-toolbar";

type PostEditorFieldsProps = {
  errors: PostFormErrors;
  form: PostFormState;
  onChange: <K extends keyof PostFormState>(
    field: K,
    value: PostFormState[K],
  ) => void;
  onTitleChange: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

export function PostEditorFields({
  errors,
  form,
  onChange,
  onTitleChange,
  textareaRef,
}: PostEditorFieldsProps) {
  return (
    <FieldGroup className="grid gap-5 md:grid-cols-2">
      <Field className="md:col-span-2" data-invalid={Boolean(errors.title)}>
        <FieldLabel htmlFor="post-title">Title</FieldLabel>
        <Input
          aria-invalid={Boolean(errors.title)}
          autoComplete="off"
          id="post-title"
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Why I am holding this session steady"
          required
          value={form.title}
        />
        <FieldError>{errors.title}</FieldError>
      </Field>

      <Field data-invalid={Boolean(errors.slug)}>
        <FieldLabel htmlFor="post-slug">URL slug</FieldLabel>
        <Input
          aria-invalid={Boolean(errors.slug)}
          autoCapitalize="none"
          autoComplete="off"
          id="post-slug"
          onChange={(event) => onChange("slug", event.target.value)}
          placeholder="holding-this-session-steady"
          required
          value={form.slug}
        />
        <FieldDescription>Published at /notes/your-slug.</FieldDescription>
        <FieldError>{errors.slug}</FieldError>
      </Field>

      <Field data-invalid={Boolean(errors.category)}>
        <FieldLabel htmlFor="post-category">Category</FieldLabel>
        <Input
          aria-invalid={Boolean(errors.category)}
          autoComplete="off"
          id="post-category"
          onChange={(event) => onChange("category", event.target.value)}
          placeholder="Training decision"
          required
          value={form.category}
        />
        <FieldError>{errors.category}</FieldError>
      </Field>

      <Field data-invalid={Boolean(errors.publishedDate)}>
        <FieldLabel htmlFor="post-date">Publish date</FieldLabel>
        <Input
          aria-invalid={Boolean(errors.publishedDate)}
          id="post-date"
          onChange={(event) => onChange("publishedDate", event.target.value)}
          required
          type="date"
          value={form.publishedDate}
        />
        <FieldError>{errors.publishedDate}</FieldError>
      </Field>

      <Field orientation="horizontal">
        <Switch
          checked={form.isVisible}
          id="post-visible"
          onCheckedChange={(checked) => onChange("isVisible", checked)}
        />
        <FieldContent>
          <FieldLabel htmlFor="post-visible">Visible on Lab Notes</FieldLabel>
          <FieldDescription>
            Hidden posts remain available to admins only.
          </FieldDescription>
        </FieldContent>
      </Field>

      <Field className="md:col-span-2" data-invalid={Boolean(errors.excerpt)}>
        <FieldLabel htmlFor="post-excerpt">Feed card excerpt</FieldLabel>
        <Textarea
          aria-invalid={Boolean(errors.excerpt)}
          id="post-excerpt"
          onChange={(event) => onChange("excerpt", event.target.value)}
          placeholder="A concise summary. Markdown lists and emphasis are supported."
          required
          rows={4}
          value={form.excerpt}
        />
        <FieldDescription>
          This Markdown appears under the title in the Lab Notes feed.
        </FieldDescription>
        <FieldError>{errors.excerpt}</FieldError>
      </Field>

      <Field className="md:col-span-2" data-invalid={Boolean(errors.content)}>
        <FieldLabel htmlFor="post-content">Post content</FieldLabel>
        <PostMarkdownToolbar
          onChange={(value) => onChange("content", value)}
          textareaRef={textareaRef}
          value={form.content}
        />
        <Textarea
          aria-invalid={Boolean(errors.content)}
          className="min-h-96 font-mono"
          id="post-content"
          onChange={(event) => onChange("content", event.target.value)}
          placeholder="Write in Markdown, or insert a block above."
          ref={textareaRef}
          required
          value={form.content}
        />
        <FieldDescription>
          Headings, paragraphs, lists, quotes, code, links, and tables render
          through Typeset.
        </FieldDescription>
        <FieldError>{errors.content}</FieldError>
      </Field>
    </FieldGroup>
  );
}
