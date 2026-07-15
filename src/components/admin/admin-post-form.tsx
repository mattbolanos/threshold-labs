"use client";

import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AdminBackLink } from "@/components/admin/admin-back-link";
import { PostMarkdown } from "@/components/posts/post-markdown";
import { PostMeta } from "@/components/posts/post-meta";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { slugifyPostTitle } from "@/lib/posts";
import { api as convexApi } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { PostEditorFields } from "./post-editor-fields";
import {
  createEmptyPostForm,
  type PostFormErrors,
  type PostFormState,
  toPostFormState,
  validatePostForm,
} from "./post-form-utils";

type AdminPostFormProps =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      postId: string;
    };

export function AdminPostForm(props: AdminPostFormProps) {
  if (props.mode === "create") {
    return <PostWriter initialForm={createEmptyPostForm()} mode="create" />;
  }

  return <EditPostLoader postId={props.postId} />;
}

function EditPostLoader({ postId }: { postId: string }) {
  const post = useQuery(convexApi.posts.getPostById, {
    postId: postId as Id<"posts">,
  });

  if (post === undefined) {
    return (
      <div className="flex flex-col gap-3">
        <AdminBackLink href="/admin/posts" label="Back to Posts" />
        <p className="text-muted-foreground text-sm">Loading post...</p>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="flex flex-col gap-3">
        <AdminBackLink href="/admin/posts" label="Back to Posts" />
        <h1 className="text-xl font-semibold">Post not found</h1>
        <p className="text-muted-foreground text-sm">
          This post may have been removed.
        </p>
      </div>
    );
  }

  return (
    <PostWriter
      initialForm={toPostFormState(post)}
      mode="edit"
      postId={post._id}
    />
  );
}

type PostWriterProps = {
  initialForm: PostFormState;
  mode: "create" | "edit";
  postId?: Id<"posts">;
};

function PostWriter({ initialForm, mode, postId }: PostWriterProps) {
  const router = useRouter();
  const createPost = useMutation(convexApi.posts.createPost);
  const updatePost = useMutation(convexApi.posts.updatePost);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const slugWasEdited = useRef(mode === "edit");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<PostFormErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const setField = <K extends keyof PostFormState>(
    field: K,
    value: PostFormState[K],
  ) => {
    if (field === "slug") slugWasEdited.current = true;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleTitleChange = (title: string) => {
    setForm((current) => ({
      ...current,
      slug: slugWasEdited.current ? current.slug : slugifyPostTitle(title),
      title,
    }));
    setErrors((current) => ({ ...current, slug: undefined, title: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const validation = validatePostForm(form);
    setErrors(validation.errors);

    if (!validation.post) {
      setErrorMessage("Review the highlighted fields before saving.");
      return;
    }

    setIsSaving(true);
    try {
      if (mode === "create") {
        await createPost({ post: validation.post });
      } else if (postId) {
        await updatePost({ post: validation.post, postId });
      }
      router.push("/admin/posts");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "The post could not be saved.",
      );
      setIsSaving(false);
    }
  };

  const previewPublishedAt =
    Date.parse(`${form.publishedDate}T12:00:00.000Z`) || Date.now();

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink href="/admin/posts" label="Back to Posts" />

      <header className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          Lab Notes
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "create" ? "New Post" : "Edit Post"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Build with Markdown blocks and review the final Typeset rendering as
          you write.
        </p>
      </header>

      {errorMessage ? (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Post settings and content</CardTitle>
              <CardDescription>
                Drafts stay private until visibility is enabled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PostEditorFields
                errors={errors}
                form={form}
                onChange={setField}
                onTitleChange={handleTitleChange}
                textareaRef={textareaRef}
              />
            </CardContent>
            <CardFooter className="flex-wrap justify-between gap-3">
              <Badge variant={form.isVisible ? "default" : "secondary"}>
                {form.isVisible ? "Visible" : "Hidden"}
              </Badge>
              <div className="flex items-center gap-2">
                <Link
                  className={buttonVariants({ variant: "ghost" })}
                  href="/admin/posts"
                >
                  Cancel
                </Link>
                <Button disabled={isSaving} type="submit">
                  {isSaving ? (
                    <IconLoader2
                      className="animate-spin"
                      data-icon="inline-start"
                    />
                  ) : (
                    <IconDeviceFloppy data-icon="inline-start" />
                  )}
                  {isSaving ? "Saving..." : "Save Post"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>

        <Card className="xl:sticky xl:top-20">
          <CardHeader>
            <CardTitle>Typeset preview</CardTitle>
            <CardDescription>
              This uses the same renderer as the public post.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <section
              aria-labelledby="feed-preview-title"
              className="flex flex-col gap-2"
            >
              <h2 className="text-sm font-medium" id="feed-preview-title">
                Feed card
              </h2>
              <Card size="sm">
                <CardHeader>
                  <CardDescription>
                    <PostMeta
                      category={form.category || "Uncategorized"}
                      publishedAt={previewPublishedAt}
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PostMarkdown
                    content={
                      form.excerpt || "Add an excerpt to preview the feed card."
                    }
                    title={form.title || "Untitled note"}
                    titleAs="h2"
                    variant="card"
                  />
                </CardContent>
                <CardFooter className="bg-transparent text-primary">
                  Expand
                </CardFooter>
              </Card>
            </section>
            <Separator />
            <section
              aria-labelledby="post-preview-title"
              className="flex flex-col gap-4"
            >
              <h2 className="text-sm font-medium" id="post-preview-title">
                Full post
              </h2>
              <PostMeta
                category={form.category || "Uncategorized"}
                publishedAt={previewPublishedAt}
              />
              <PostMarkdown
                content={form.content || "Start writing to preview the post."}
                title={form.title || "Untitled note"}
              />
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
