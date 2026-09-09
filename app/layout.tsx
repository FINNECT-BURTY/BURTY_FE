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

const APP_NAME = "Berty";
const APP_DESCRIPTION = "AI 생활금융 에이전트";

/**
 * 공유 카드에 쓰는 절대 URL 의 기준.
 *
 * <p>Open Graph 이미지에 상대 경로를 쓰려면 반드시 있어야 한다 — 없으면 빌드가 실패한다.
 * 배포 도메인이 다르면 NEXT_PUBLIC_APP_BASE_URL 로 덮어쓴다.
 */
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL ?? "https://burty.co.kr";

export const metadata: Metadata = {
  metadataBase: new URL(APP_BASE_URL),
  applicationName: APP_NAME,
  title: APP_NAME,
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: APP_NAME,
      },
    ],
  },
  // 카드에 계좌·잔액 같은 값이 실리지 않게 요약만 둔다. 링크는 공유되는 순간
  // 어디로 갈지 알 수 없다.
  twitter: {
    card: "summary",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/icons/icon-512x512.png"],
  },
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
      className={`${pretendard.variable} h-full bg-background antialiased overscroll-none`}
    >
      <body className="h-dvh overflow-hidden bg-background text-grayscale-1000 overscroll-none">
        <PwaRegister />
        <MobileAppShell>{children}</MobileAppShell>
      </body>
    </html>
  );
}
