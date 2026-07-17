import { describe, expect, test } from "bun:test";
import { formatPostDate, slugifyPostTitle } from "@/lib/posts";
import { validatePostForm } from "./post-form-utils";

describe("Lab Note helpers", () => {
  test("creates stable slugs from post titles", () => {
    expect(slugifyPostTitle("  Heat, hills & LT2  ")).toBe("heat-hills-lt2");
  });

  test("formats publish dates in UTC", () => {
    expect(formatPostDate(Date.UTC(2026, 6, 4))).toBe("Jul 4, 2026");
  });

  test("normalizes a valid writer submission", () => {
    const result = validatePostForm({
      category: " Training decision ",
      content: " Keep the dose steady. ",
      excerpt: " One more week. ",
      isVisible: false,
      publishedDate: "2026-07-04",
      slug: " Keep LT2 Steady ",
      title: " Keep LT2 Steady ",
    });

    expect(result.errors).toEqual({});
    expect(result.post).toEqual({
      category: "Training decision",
      content: "Keep the dose steady.",
      excerpt: "One more week.",
      isVisible: false,
      publishedAt: Date.parse("2026-07-04T12:00:00.000Z"),
      slug: "keep-lt2-steady",
      title: "Keep LT2 Steady",
    });
  });

  test("reports missing required post fields", () => {
    const result = validatePostForm({
      category: "",
      content: "",
      excerpt: "",
      isVisible: false,
      publishedDate: "not-a-date",
      slug: "",
      title: "",
    });

    expect(result.post).toBeNull();
    expect(Object.keys(result.errors)).toEqual([
      "title",
      "slug",
      "category",
      "excerpt",
      "content",
      "publishedDate",
    ]);
  });
});
