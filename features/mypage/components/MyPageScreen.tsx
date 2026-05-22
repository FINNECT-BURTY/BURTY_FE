"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { backendFetch } from "@/shared/api/backendFetch";
import { useCurrentUser } from "@/shared/auth/currentUser";
import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";
import { ConfirmModal } from "@/shared/ui/ConfirmModal";

type MyPageMenuSection = Readonly<{
  items: readonly MyPageMenuItem[];
  title: string;
}>;

type MyPageMenuItem = Readonly<{
  label: string;
  onClick?: () => void;
}>;

function MenuRow({ item }: Readonly<{ item: MyPageMenuItem }>) {
  return (
    <button
      className="flex h-8 w-full items-center justify-between text-left"
      onClick={item.onClick}
      type="button"
    >
      <span className="text-body-md text-grayscale-1000">{item.label}</span>
      <Image
        alt=""
        aria-hidden="true"
        height={17}
        src="/icons/finance/right-arrow-gray-800.svg"
        width={10}
      />
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
      router.replace("/onboarding?step=entry");
    }
  };

  const menuSections: readonly MyPageMenuSection[] = [
    {
      items: [{ label: "금융 연동 관리" }, { label: "고정 지출 관리" }],
      title: "계정 및 데이터",
    },
    {
      items: [{ label: "알림 설정" }, { label: "위험 알림 ON/OFF" }],
      title: "알림",
    },
    {
      items: [{ label: "인증 설정" }, { label: "비밀번호 / 생체 인증" }],
      title: "보안",
    },
    {
      items: [{ label: "앱 설정" }, { label: "로그아웃", onClick: handleOpenLogoutModal }],
      title: "앱 설정",
    },
  ];

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto pb-4">
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

        <div className="-mx-6 h-2 bg-grayscale-100" />

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
          primaryLabel={isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          secondaryLabel="취소"
          title="정말로 로그아웃하시겠습니까?"
        />
      ) : null}
    </main>
  );
}
