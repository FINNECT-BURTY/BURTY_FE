import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/app/pwa-register";
import { MobileAppShell } from "@/shared/layout/mobile-app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Berty",
  title: "Berty",
  description: "AI 생활금융 에이전트",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Berty",
  },
  // TODO: Open Graph 추가
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#181919",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-sub-background text-foreground">
        <PwaRegister />
        <MobileAppShell>{children}</MobileAppShell>
      </body>
    </html>
  );
}
