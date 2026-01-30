import { NoInvite } from "@/components/auth/no-invite";

export default async function UnauthorizedPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email } = await params;

  return <NoInvite email={email} />;
}
