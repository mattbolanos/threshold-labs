import "server-only";

import { cookies } from "next/headers";
import {
  DEFAULT_PREVIEW_ROLE,
  PREVIEW_ROLE_COOKIE,
  parsePreviewRole,
} from "./preview-role";

export const isVercelPreview = process.env.VERCEL_ENV === "preview";
export const isPreviewAuthBypassEnabled =
  isVercelPreview && process.env.PREVIEW_AUTH_BYPASS !== "false";

export async function getPreviewAuthState() {
  if (!isPreviewAuthBypassEnabled) {
    return {
      enabled: false,
      role: DEFAULT_PREVIEW_ROLE,
    } as const;
  }

  const cookieStore = await cookies();

  return {
    enabled: true,
    role: parsePreviewRole(cookieStore.get(PREVIEW_ROLE_COOKIE)?.value),
  } as const;
}
