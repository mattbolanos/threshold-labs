import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Access your Threshold Lab account",
  title: "Sign In | Threshold Lab",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="route-padding-x relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden py-10">
      {/* Subtle grid pattern background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Gradient orbs */}
      <div
        aria-hidden="true"
        className="bg-foreground/8 absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="bg-foreground/5 absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl"
      />

      {children}
    </div>
  );
}
