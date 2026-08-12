import { describe, expect, test } from "bun:test";
import { sortPostsByPinnedThenPublishedAt } from "./postSorting";

describe("sortPostsByPinnedThenPublishedAt", () => {
  test("places pinned posts first and keeps each group newest-first", () => {
    const posts = [
      { isPinned: false, publishedAt: 40, title: "Newest" },
      { isPinned: true, publishedAt: 10, title: "Older pinned" },
      { isPinned: true, publishedAt: 30, title: "Newer pinned" },
      { publishedAt: 20, title: "Older" },
    ];

    expect(
      sortPostsByPinnedThenPublishedAt(posts).map((post) => post.title),
    ).toEqual(["Newer pinned", "Older pinned", "Newest", "Older"]);
    expect(posts[0]?.title).toBe("Newest");
  });
});
