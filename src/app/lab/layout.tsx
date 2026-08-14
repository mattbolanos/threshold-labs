import { checkLabAccess } from "@/lib/auth";

export default async function LabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await checkLabAccess();

  return children;
}
