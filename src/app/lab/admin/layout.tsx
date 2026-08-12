export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col gap-6 bg-background">{children}</div>;
}
