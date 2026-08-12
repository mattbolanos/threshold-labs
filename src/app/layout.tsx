import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Suspense } from "react";
import { SiteShell } from "@/components/site-shell";
import { getPreviewAuthState } from "@/lib/auth/preview.server";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  appleWebApp: {
    title: "Threshold Lab",
  },
  description: "Train Smarter. Race Faster.",
  title: "Threshold Lab",
};

async function AppShell({ children }: { children: React.ReactNode }) {
  const preview = await getPreviewAuthState();

  return (
    <SiteShell isPreview={preview.enabled} previewRole={preview.role}>
      <Suspense>{children}</Suspense>
    </SiteShell>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${outfit.variable} ${jetbrainsMono.variable} dark`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {process.env.NEXT_PUBLIC_REACT_SCAN === "true" && (
          <Script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="min-h-full overscroll-y-contain bg-background text-foreground antialiased">
        <main>
          <Suspense>
            <AppShell>{children}</AppShell>
          </Suspense>
        </main>
      </body>
    </html>
  );
}
