"use client";

import { useRouter } from "next/navigation";
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

type AuthStatus =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "needs-onboarding";

const ONBOARDING_REDIRECT_PATH = "/onboarding?step=agreement&newUser=true";

export function MainRouteGuard({
  children,
  checkingFallback,
  unauthenticatedFallback,
}: MainRouteGuardProps) {
  const router = useRouter();
  const { isSplashComplete } = useSplashGate();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  useEffect(() => {
    if (!isSplashComplete || !pendingRedirect) return;
    router.replace(pendingRedirect);
    const timer = window.setTimeout(() => setPendingRedirect(null), 0);
    return () => window.clearTimeout(timer);
  }, [isSplashComplete, pendingRedirect, router]);

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

        // fetchCurrentUser 가 /auth/me + 프로필 이름으로 완료 여부를 판단한다.
        if (user.profileComplete !== true) {
          setAuthStatus("needs-onboarding");
          setPendingRedirect(ONBOARDING_REDIRECT_PATH);
          return;
        }

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
  }, [router, unauthenticatedFallback]);

  if (authStatus === "checking" || authStatus === "needs-onboarding") {
    return checkingFallback ?? <LoadingScreen />;
  }

  if (authStatus === "unauthenticated") {
    return unauthenticatedFallback ?? checkingFallback ?? <LoadingScreen />;
  }

  return currentUser ? (
    <CurrentUserProvider user={currentUser}>{children}</CurrentUserProvider>
  ) : null;
}
