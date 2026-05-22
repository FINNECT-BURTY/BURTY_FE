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
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
