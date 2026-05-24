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

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export function MainRouteGuard({
  children,
  checkingFallback,
  unauthenticatedFallback,
}: MainRouteGuardProps) {
  const router = useRouter();
  const hasUnauthenticatedFallback = unauthenticatedFallback !== undefined;
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const user = await fetchCurrentUser();

        if (user) {
          if (mounted) {
            setCurrentUser(user);
            setAuthStatus("authenticated");
          }
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }

      if (mounted) {
        if (hasUnauthenticatedFallback) {
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
  }, [hasUnauthenticatedFallback, router]);

  if (authStatus !== "authenticated") {
    if (unauthenticatedFallback) {
      return unauthenticatedFallback;
    }

    return checkingFallback ?? <LoadingScreen />;
  }

  return currentUser ? (
    <CurrentUserProvider user={currentUser}>{children}</CurrentUserProvider>
  ) : null;
}
