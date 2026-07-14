import { NoInvite } from "@/components/auth/no-invite";

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const { email: emailParam } = await searchParams;
  const email = Array.isArray(emailParam) ? emailParam[0] : emailParam;

  return <NoInvite email={email ?? ""} />;
}
