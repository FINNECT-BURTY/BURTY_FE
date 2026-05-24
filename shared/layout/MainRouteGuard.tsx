"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  type CurrentUser,
  CurrentUserProvider,
} from "@/shared/auth/currentUser";
import { fetchCurrentUser } from "@/shared/auth/fetchCurrentUser";
import { LoadingScreen } from "@/shared/layout/LoadingScreen";

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
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

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

          router.replace("/onboarding");
          return;
        }

        // 백엔드에서 profileComplete 를 명시적으로 true 로 내려준 경우에만 홈으로 진입한다.
        // undefined / false 모두 안전하게 온보딩으로 보낸다.
        if (user.profileComplete !== true) {
          setAuthStatus("needs-onboarding");
          router.replace(ONBOARDING_REDIRECT_PATH);
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

        router.replace("/onboarding");
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
