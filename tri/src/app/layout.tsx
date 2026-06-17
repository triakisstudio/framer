import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { MobileNav } from "@/components/MobileNav";
import { PWARegister } from "@/components/PWARegister";
import { InstallPrompt } from "@/components/InstallPrompt";
import { getCurrentUser } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Tri",
  title: "Tri — find your people again",
  description:
    "Import the accounts you followed on Instagram, see them as a tree, and reconnect when your friends arrive on Tri.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tri",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-icon-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0a12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-[100dvh] flex-col tri-aurora">
        <PWARegister />
        <SiteHeader
          user={
            user ? { igUsername: user.igUsername, avatarUrl: user.avatarUrl } : null
          }
        />
        <main className={`flex-1 ${user ? "pb-24 md:pb-0" : ""}`}>{children}</main>
        {!user && (
          <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted">
            Tri imports your own Instagram data export — no scraping, no
            Instagram login required.
          </footer>
        )}
        {user && <MobileNav username={user.igUsername} />}
        <InstallPrompt />
      </body>
    </html>
  );
}
