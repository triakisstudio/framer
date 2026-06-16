import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tri — find your people again",
  description:
    "Import the accounts you followed on Instagram, see them as a tree, and reconnect when your friends arrive on Tri.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col tri-aurora">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted">
          Tri imports your own Instagram data export — no scraping, no Instagram
          login required.
        </footer>
      </body>
    </html>
  );
}
