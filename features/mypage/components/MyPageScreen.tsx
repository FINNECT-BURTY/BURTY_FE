"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logoutAuthSession } from "@/shared/api/authSession";
import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";

export function MyPageScreen() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setErrorMessage("");

    const ok = await logoutAuthSession().catch(() => false);
    if (!ok) {
      setErrorMessage("로그아웃하지 못했어요. 잠시 후 다시 시도해 주세요.");
      setIsLoggingOut(false);
      return;
    }

    router.replace("/onboarding");
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto bg-grayscale-100 px-6 py-6">
        <section className="rounded-lg border border-grayscale-200 bg-background px-5 py-5">
          <h1 className="text-title-lg text-grayscale-1000">내정보</h1>
          <p className="text-body-md mt-2 text-grayscale-900">
            로그인 세션과 계정 정보를 관리합니다.
          </p>
        </section>

        <button
          className="text-title-sm mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-lg border border-grayscale-200 bg-background px-5 text-grayscale-1000 disabled:opacity-60"
          disabled={isLoggingOut}
          onClick={handleLogout}
          type="button"
        >
          <LogOut aria-hidden="true" size={18} strokeWidth={2.1} />
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>

        {errorMessage ? (
          <p className="text-caption mt-3 text-center text-red-600">
            {errorMessage}
          </p>
        ) : null}
      </section>

      <BottomNavigation />
    </main>
  );
}
