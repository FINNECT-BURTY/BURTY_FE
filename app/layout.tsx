import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { MobileAppShell } from "@/shared/layout/MobileAppShell";
import { PwaRegister } from "@/shared/pwa/PwaRegister";

import "./globals.css";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "Berty",
  title: "Berty",
  description: "AI 생활금융 에이전트",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} h-full bg-background antialiased overscroll-none`}
    >
      <body className="h-dvh overflow-hidden bg-background text-grayscale-1000 overscroll-none">
        <PwaRegister />
        <MobileAppShell>{children}</MobileAppShell>
      </body>
    </html>
  );
}
