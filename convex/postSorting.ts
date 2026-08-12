type PinnablePost = {
  isPinned?: boolean;
  publishedAt: number;
};

export const sortPostsByPinnedThenPublishedAt = <Post extends PinnablePost>(
  posts: Post[],
) =>
  posts.toSorted((firstPost, secondPost) => {
    const pinnedDifference =
      Number(Boolean(secondPost.isPinned)) -
      Number(Boolean(firstPost.isPinned));

    return pinnedDifference || secondPost.publishedAt - firstPost.publishedAt;
  });
