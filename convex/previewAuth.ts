export type PreviewRole = "admin" | "client";

export const isPreviewAuthEnabled = () =>
  process.env.PREVIEW_AUTH_BYPASS === "true";

export const createPreviewUser = (role: PreviewRole = "admin") => ({
  createdAt: 0,
  email: "preview@threshold.local",
  emailVerified: true,
  name: role === "admin" ? "Preview Admin" : "Preview Client",
  role,
  updatedAt: 0,
});
