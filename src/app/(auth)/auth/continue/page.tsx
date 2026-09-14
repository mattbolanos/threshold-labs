import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getPostAuthDestination } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Checking Membership | Threshold Lab",
};

interface PostAuthRedirectProps {
  searchParams: Promise<{ error?: string | string[] }>;
}

async function PostAuthRedirect({ searchParams }: PostAuthRedirectProps) {
  const { error } = await searchParams;
  if (error) {
    redirect("/login");
  }

  return redirect(await getPostAuthDestination());
}

function PostAuthRedirectFallback() {
  return (
    <p aria-live="polite" className="text-sm text-muted-foreground">
      Checking membership…
    </p>
  );
}

export default function PostAuthContinuePage({
  searchParams,
}: PostAuthRedirectProps) {
  return (
    <Suspense fallback={<PostAuthRedirectFallback />}>
      <PostAuthRedirect searchParams={searchParams} />
    </Suspense>
  );
}
