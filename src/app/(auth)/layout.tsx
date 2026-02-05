import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Access your Threshold Lab account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="noise-texture route-padding-x relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden py-10">
      {/* Diagonal slash lines — athletic motif */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.035]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -55deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          )`,
        }}
      />

      {/* Top-right accent glow — primary color bleed */}
      <div
        aria-hidden="true"
        className="bg-primary/8 dark:bg-primary/6 absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full blur-[120px]"
      />

      {/* Bottom-left subtle anchor */}
      <div
        aria-hidden="true"
        className="bg-foreground/4 absolute -bottom-48 -left-48 h-[400px] w-[400px] rounded-full blur-[100px]"
      />

      {/* Geometric corner accents */}
      <div
        aria-hidden="true"
        className="border-primary/15 absolute top-8 left-8 h-16 w-16 border-t-2 border-l-2"
      />
      <div
        aria-hidden="true"
        className="border-primary/15 absolute right-8 bottom-8 h-16 w-16 border-r-2 border-b-2"
      />

      {children}
    </div>
  );
}
