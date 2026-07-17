"use client";

import {
  IconDeviceFloppy,
  IconEdit,
  IconEye,
  IconLoader2,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AdminBackLink } from "@/components/admin/admin-back-link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { slugifyPostTitle } from "@/lib/posts";
import { api as convexApi } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { PostContentEditor } from "./post-content-editor";
import { PostEditorFields } from "./post-editor-fields";
import {
  createEmptyPostForm,
  type PostFormErrors,
  type PostFormState,
  toPostFormState,
  validatePostForm,
} from "./post-form-utils";
import { PostPreview } from "./post-preview";

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
  const [activeContentTab, setActiveContentTab] = useState("edit");

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
      setActiveContentTab("edit");
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

      <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Post settings</CardTitle>
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
            />
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="pb-4">
            <CardTitle>Post content</CardTitle>
            <CardDescription>
              Write in Markdown, then preview the rendered post.
            </CardDescription>
          </CardHeader>

          <Tabs
            className="w-full flex-col gap-0"
            onValueChange={setActiveContentTab}
            value={activeContentTab}
          >
            <TabsList
              aria-label="Post content view"
              className="h-10 w-full justify-start rounded-none border-y px-4"
              variant="line"
            >
              <TabsTrigger className="flex-none px-3" value="edit">
                <IconEdit data-icon="inline-start" />
                Edit
              </TabsTrigger>
              <TabsTrigger className="flex-none px-3" value="preview">
                <IconEye data-icon="inline-start" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent className="w-full" value="edit">
              <CardContent className="py-4">
                <PostContentEditor
                  error={errors.content}
                  onChange={(value) => setField("content", value)}
                  textareaRef={textareaRef}
                  value={form.content}
                />
              </CardContent>
            </TabsContent>

            <TabsContent className="w-full" value="preview">
              <CardContent className="py-4">
                <PostPreview content={form.content} />
              </CardContent>
            </TabsContent>
          </Tabs>

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
    </div>
  );
}
