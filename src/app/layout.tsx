import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "development" && (
          <script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
      >
        <main>
          <div className="mx-auto max-w-[1320px] p-5 pb-14 sm:p-8 md:px-6 md:pt-20 md:pb-18">
            <Providers>{children}</Providers>
          </div>
        </main>
      </body>
    </html>
  );
}
