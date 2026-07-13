import { slugifyPostTitle } from "@/lib/posts";
import type { Doc } from "../../../convex/_generated/dataModel";

export type PostFormState = {
  category: string;
  content: string;
  excerpt: string;
  isVisible: boolean;
  publishedDate: string;
  slug: string;
  title: string;
};

export type PostFormErrors = Partial<Record<keyof PostFormState, string>>;

export const createEmptyPostForm = (): PostFormState => ({
  category: "Training decision",
  content: "",
  excerpt: "",
  isVisible: false,
  publishedDate: new Date().toISOString().slice(0, 10),
  slug: "",
  title: "",
});

export const toPostFormState = (post: Doc<"posts">): PostFormState => ({
  category: post.category,
  content: post.content,
  excerpt: post.excerpt,
  isVisible: post.isVisible,
  publishedDate: new Date(post.publishedAt).toISOString().slice(0, 10),
  slug: post.slug,
  title: post.title,
});

export const validatePostForm = (form: PostFormState) => {
  const errors: PostFormErrors = {};
  const title = form.title.trim();
  const slug = slugifyPostTitle(form.slug);
  const category = form.category.trim();
  const excerpt = form.excerpt.trim();
  const content = form.content.trim();
  const publishedAt = Date.parse(`${form.publishedDate}T12:00:00.000Z`);

  if (!title) errors.title = "Add a title.";
  if (!slug) errors.slug = "Add a valid URL slug.";
  if (!category) errors.category = "Add a category.";
  if (!excerpt) errors.excerpt = "Add an excerpt for the feed card.";
  if (!content) errors.content = "Add the post content.";
  if (!Number.isFinite(publishedAt)) {
    errors.publishedDate = "Choose a valid publish date.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors, post: null };
  }

  return {
    errors,
    post: {
      category,
      content,
      excerpt,
      isVisible: form.isVisible,
      publishedAt,
      slug,
      title,
    },
  };
};
