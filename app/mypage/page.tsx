"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { backendFetch } from "@/shared/api/backendFetch";
import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";
import { MainRouteGuard } from "@/shared/layout/MainRouteGuard";
import { BottomActionButton } from "@/shared/ui/BottomActionButton";

export default function Page() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <MainRouteGuard>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-grayscale-1000">
        <MainHeader />

        <section className="min-h-0 flex-1 overflow-y-auto bg-grayscale-100 px-6 py-6">
          <div className="rounded-lg border border-grayscale-200 bg-background px-5 py-5">
            <h1 className="text-title-lg text-grayscale-1000">내정보</h1>
            <p className="text-body-md mt-2 text-grayscale-900">
              내정보 화면
            </p>

            <BottomActionButton
              className="mt-6"
              disabled={isLoggingOut}
              onClick={handleLogout}
              textStyle="title-sm"
            >
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </BottomActionButton>
          </div>
        </section>

        <BottomNavigation />
      </main>
    </MainRouteGuard>
  );
}
