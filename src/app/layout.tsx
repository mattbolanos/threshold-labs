import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { NavBar } from "@/components/nav/nav-bar";
import { Providers } from "./providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  description: "Train Smarter. Race Faster.",
  title: "Threshold Lab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${outfit.variable} ${jetbrainsMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {process.env.NODE_ENV === "development" && (
          <script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
        )}
      </head>
      <body className="bg-background text-foreground min-h-full overscroll-y-contain antialiased">
        <main>
          <Providers>
            <NavBar />
            <Suspense>{children}</Suspense>
          </Providers>
        </main>
      </body>
    </html>
  );
}
