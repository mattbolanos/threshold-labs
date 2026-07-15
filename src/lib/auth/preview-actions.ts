"use server";

import { cookies } from "next/headers";
import { isVercelPreview } from "./preview.server";
import { PREVIEW_ROLE_COOKIE, type PreviewRole } from "./preview-role";

export async function setPreviewRole(role: PreviewRole) {
  if (!isVercelPreview) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(PREVIEW_ROLE_COOKIE, role, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
}
