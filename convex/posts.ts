import { ConvexError, v } from "convex/values";
import {
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { authComponent } from "./auth";

const postInputValidator = v.object({
  category: v.string(),
  content: v.string(),
  excerpt: v.string(),
  isVisible: v.boolean(),
  publishedAt: v.number(),
  slug: v.string(),
  title: v.string(),
});

type PostInput = {
  category: string;
  content: string;
  excerpt: string;
  isVisible: boolean;
  publishedAt: number;
  slug: string;
  title: string;
};

const assertAdmin = async (ctx: QueryCtx | MutationCtx) => {
  const user = await authComponent.safeGetAuthUser(ctx);

  if (!user || user.role !== "admin") {
    throw new ConvexError("Only admins can manage posts.");
  }
};

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizePost = (post: PostInput) => {
  const category = post.category.trim();
  const content = post.content.trim();
  const excerpt = post.excerpt.trim();
  const slug = normalizeSlug(post.slug);
  const title = post.title.trim();

  if (!title) {
    throw new ConvexError("Title is required.");
  }
  if (!slug) {
    throw new ConvexError("Slug is required.");
  }
  if (!category) {
    throw new ConvexError("Category is required.");
  }
  if (!excerpt) {
    throw new ConvexError("Excerpt is required.");
  }
  if (!content) {
    throw new ConvexError("Post content is required.");
  }
  if (!Number.isFinite(post.publishedAt) || post.publishedAt <= 0) {
    throw new ConvexError("Publish date is invalid.");
  }

  return {
    category,
    content,
    excerpt,
    isVisible: post.isVisible,
    publishedAt: post.publishedAt,
    slug,
    title,
  };
};

const assertUniqueSlug = async (
  ctx: MutationCtx,
  slug: string,
  currentPostId?: string,
) => {
  const existing = await ctx.db
    .query("posts")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();

  if (existing && existing._id.toString() !== currentPostId) {
    throw new ConvexError("A post already uses this slug.");
  }
};

export const createPost = mutation({
  args: {
    post: postInputValidator,
  },
  handler: async (ctx, { post }) => {
    await assertAdmin(ctx);
    const normalizedPost = normalizePost(post);
    await assertUniqueSlug(ctx, normalizedPost.slug);
    const now = Date.now();

    return await ctx.db.insert("posts", {
      ...normalizedPost,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updatePost = mutation({
  args: {
    post: postInputValidator,
    postId: v.id("posts"),
  },
  handler: async (ctx, { post, postId }) => {
    await assertAdmin(ctx);
    const existingPost = await ctx.db.get(postId);

    if (!existingPost) {
      throw new ConvexError("Post not found.");
    }

    const normalizedPost = normalizePost(post);
    await assertUniqueSlug(ctx, normalizedPost.slug, postId.toString());
    await ctx.db.patch(postId, {
      ...normalizedPost,
      updatedAt: Date.now(),
    });

    return postId;
  },
});

export const setPostVisibility = mutation({
  args: {
    isVisible: v.boolean(),
    postId: v.id("posts"),
  },
  handler: async (ctx, { isVisible, postId }) => {
    await assertAdmin(ctx);
    const existingPost = await ctx.db.get(postId);

    if (!existingPost) {
      throw new ConvexError("Post not found.");
    }

    await ctx.db.patch(postId, { isVisible, updatedAt: Date.now() });
    return postId;
  },
});

export const getPublishedPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_visibility_and_published_at", (q) =>
        q.eq("isVisible", true),
      )
      .order("desc")
      .collect();

    return posts.map((post) => ({
      _id: post._id,
      category: post.category,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      slug: post.slug,
      title: post.title,
    }));
  },
});

export const getPublishedPostBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", normalizeSlug(slug)))
      .first();

    return post?.isVisible ? post : null;
  },
});

export const getPostsForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    return await ctx.db
      .query("posts")
      .withIndex("by_published_at")
      .order("desc")
      .collect();
  },
});

export const getPostById = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, { postId }) => {
    await assertAdmin(ctx);
    return await ctx.db.get(postId);
  },
});
