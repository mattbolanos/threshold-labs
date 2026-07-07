export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background route-padding-x route-padding-y mx-auto flex w-full max-w-7xl flex-col gap-6">
      {children}
    </div>
  );
}
