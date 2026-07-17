export const DEFAULT_PREVIEW_ROLE = "admin";
export const PREVIEW_ROLE_COOKIE = "threshold_preview_role";

export type PreviewRole = "admin" | "client";

export function parsePreviewRole(value?: string): PreviewRole {
  return value === "client" ? "client" : DEFAULT_PREVIEW_ROLE;
}
