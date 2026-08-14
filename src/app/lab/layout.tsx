import { checkAuth } from "@/lib/auth";

export default async function LabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await checkAuth();

  return children;
}
