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
}>;

type AuthStatus = "checking" | "authenticated";

export function MainRouteGuard({ children }: MainRouteGuardProps) {
  const router = useRouter();
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
        router.replace("/onboarding?step=entry");
      }
    }

    void checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (authStatus !== "authenticated") {
    return <LoadingScreen />;
  }

  return currentUser ? (
    <CurrentUserProvider user={currentUser}>{children}</CurrentUserProvider>
  ) : null;
}
