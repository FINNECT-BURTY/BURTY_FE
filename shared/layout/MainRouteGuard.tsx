"use client";

import { useEffect, useState } from "react";

import {
  type CurrentUser,
  CurrentUserProvider,
} from "@/shared/auth/currentUser";
import { fetchCurrentUser } from "@/shared/auth/fetchCurrentUser";
import { LoadingScreen } from "@/shared/layout/LoadingScreen";
import { useSplashGate } from "@/shared/layout/SplashGateContext";

type MainRouteGuardProps = Readonly<{
  children: React.ReactNode;
  checkingFallback?: React.ReactNode;
  unauthenticatedFallback?: React.ReactNode;
}>;

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export function MainRouteGuard({
  children,
  checkingFallback,
  unauthenticatedFallback,
}: MainRouteGuardProps) {
  const { isSplashComplete } = useSplashGate();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (!isSplashComplete || !pendingRedirect) return;
    window.location.replace(pendingRedirect);
    const timer = window.setTimeout(() => setPendingRedirect(null), 0);
    return () => window.clearTimeout(timer);
  }, [isSplashComplete, pendingRedirect]);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const user = await fetchCurrentUser();

        if (!mounted) return;

        if (!user) {
          if (unauthenticatedFallback !== undefined) {
            setAuthStatus("unauthenticated");
            return;
          }

          setPendingRedirect("/onboarding");
          return;
        }

        // 로그인된 사용자는 홈에 진입한다.
        // BE profileComplete=false 오탐으로 온보딩을 반복시키지 않는다.
        // 신규 사용자는 소셜/이메일 콜백 단계에서 온보딩으로 보낸다.
        setCurrentUser(user);
        setAuthStatus("authenticated");
      } catch (error) {
        console.error("Auth check failed:", error);

        if (!mounted) return;

        if (unauthenticatedFallback !== undefined) {
          setAuthStatus("unauthenticated");
          return;
        }

        setPendingRedirect("/onboarding");
      }
    }

    void checkAuth();

    return () => {
      mounted = false;
    };
  }, [unauthenticatedFallback]);

  if (authStatus === "checking") {
    return checkingFallback ?? <LoadingScreen />;
  }

  if (authStatus === "unauthenticated") {
    return unauthenticatedFallback ?? checkingFallback ?? <LoadingScreen />;
  }

  return currentUser ? (
    <CurrentUserProvider user={currentUser}>{children}</CurrentUserProvider>
  ) : null;
}
