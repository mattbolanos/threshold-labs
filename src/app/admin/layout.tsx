export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background route-padding-y mx-auto flex max-w-[var(--max-app-width)] flex-col gap-6">
      {children}
    </div>
  );
}
