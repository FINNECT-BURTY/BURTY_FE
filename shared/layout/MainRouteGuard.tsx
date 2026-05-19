"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { backendFetch } from "@/shared/api/backendFetch";
import { LoadingScreen } from "@/shared/layout/LoadingScreen";

type MainRouteGuardProps = Readonly<{
  children: React.ReactNode;
}>;

type AuthStatus = "checking" | "authenticated";

type CurrentUserResponse = Readonly<{
  success: boolean;
  data?: Readonly<{
    userId?: string;
    profileComplete?: boolean;
  }> | null;
}>;

export function MainRouteGuard({ children }: MainRouteGuardProps) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const response = await backendFetch("/api/v1/auth/me", {
          cache: "no-store",
          method: "GET",
        });
        const payload = (await response.json().catch(() => null)) as
          | CurrentUserResponse
          | null;

        if (response.ok && payload?.success === true) {
          if (mounted) setAuthStatus("authenticated");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }

      if (mounted) {
        router.replace("/onboarding?step=entry");
      }
    }

    void checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (authStatus !== "authenticated") {
    return (
      <LoadingScreen
        description="잠시만 기다려 주세요"
        title="로그인 상태를 확인하고 있어요"
      />
    );
  }

  return <>{children}</>;
}
