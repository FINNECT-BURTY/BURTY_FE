"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { backendFetch } from "@/shared/api/backendFetch";
import { useCurrentUser } from "@/shared/auth/currentUser";
import {
  clearAuthTokens,
  clearSessionMarker,
} from "@/shared/auth/tokenStorage";
import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";

type MyPageMenuSection = Readonly<{
  items: readonly MyPageMenuItem[];
  title: string;
}>;

type MyPageMenuItem = Readonly<{
  /** 이동할 경로. onClick 과 둘 중 하나만 쓴다. */
  href?: string;
  label: string;
  onClick?: () => void;
}>;

/**
 * 메뉴 한 줄.
 *
 * <p>이동은 링크로, 동작은 버튼으로 낸다. 예전에는 전부 버튼이었고 그중 일곱 개가
 * 핸들러 없이 놓여 있었다 — 눌러도 아무 일이 없는 버튼은 스크린리더에서 조작 가능한
 * 요소로 읽히고, 사용자에게는 앱이 고장난 것처럼 보인다.
 */
function MenuRow({ item }: Readonly<{ item: MyPageMenuItem }>) {
  const content = (
    <>
      <span className="text-body-md text-grayscale-1000">{item.label}</span>
      <Image
        alt=""
        aria-hidden="true"
        height={17}
        src="/icons/finance/right-arrow-gray-800.svg"
        width={10}
      />
    </>
  );

  const className = "flex h-11 w-full items-center justify-between text-left";

  if (item.href) {
    return (
      <Link className={className} href={item.href}>
        {content}
      </Link>
    );
  }

  return (
    <button className={className} onClick={item.onClick} type="button">
      {content}
    </button>
  );
}

function ProfileAvatar() {
  return (
    <Image
      alt=""
      aria-hidden="true"
      height={64}
      priority
      src="/icons/mypage/profile.svg"
      width={64}
    />
  );
}

export function MyPageScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleOpenLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const handleCloseLogoutModal = () => {
    if (isLoggingOut) return;
    setIsLogoutModalOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await backendFetch("/api/v1/auth/logout", {
        body: "{}",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuthTokens();
      clearSessionMarker();
      router.replace("/onboarding?step=entry");
    }
  };

  // 실제로 동작하는 것만 남긴다. 백엔드가 없는 항목(알림 설정, 앱 설정)은
  // 자리만 차지하고 눌러도 아무 일이 없었으므로 뺐다.
  const menuSections: readonly MyPageMenuSection[] = [
    {
      items: [
        { href: "/transactions", label: "거래내역" },
        { href: "/mypage/institutions", label: "금융 연동 관리" },
        { href: "/mypage/schedules", label: "고정 지출 관리" },
        { href: "/mypage/privacy", label: "내 개인정보" },
        { href: "/mypage/terms", label: "약관 및 정책" },
      ],
      title: "계정 및 데이터",
    },
    {
      items: [
        { href: "/mypage/security", label: "기기 및 로그인 관리" },
        { href: "/mypage/security/passkey", label: "패스키 등록" },
      ],
      title: "보안",
    },
    {
      items: [{ href: "/family", label: "가족 보호 및 승인" }],
      title: "가족",
    },
    {
      items: [{ label: "로그아웃", onClick: handleOpenLogoutModal }],
      title: "계정",
    },
  ];

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-4">
        <section className="flex flex-col items-center py-5 text-center">
          <ProfileAvatar />
          <h1 className="text-title-md mt-3 text-grayscale-1000">
            {user.displayName}님
          </h1>
          <button
            className="text-body-md mt-4 rounded-3xl border border-grayscale-200 px-4 py-2 text-grayscale-800"
            type="button"
          >
            내 정보수정
          </button>
        </section>

        <div className="h-2 w-full bg-grayscale-100" />

        <section className="px-5 py-6">
          {menuSections.map((section, index) => {
            const isLast = index === menuSections.length - 1;

            return (
              <section key={section.title}>
                <div className={index === 0 ? "" : "pt-7"}>
                  <h2 className="text-title-sm text-grayscale-1000">
                    {section.title}
                  </h2>
                  <div className="mt-2">
                    {section.items.map((item) => (
                      <MenuRow item={item} key={item.label} />
                    ))}
                  </div>
                </div>
                {isLast ? null : (
                  <div
                    aria-hidden="true"
                    className="mt-7 h-px bg-grayscale-100"
                  />
                )}
              </section>
            );
          })}

          <p className="text-caption mt-8 text-center text-grayscale-300">
            버전 1.1.1
          </p>
        </section>
      </section>

      <BottomNavigation />

      {isLogoutModalOpen ? (
        <ConfirmModal
          onPrimary={handleLogout}
          onSecondary={handleCloseLogoutModal}
          primaryDisabled={isLoggingOut}
          primaryLabel="로그아웃"
          secondaryLabel="취소"
          title="정말로 로그아웃하시겠습니까?"
        />
      ) : null}
    </main>
  );
}
