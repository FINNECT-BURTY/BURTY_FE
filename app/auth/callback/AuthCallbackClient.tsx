"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { hydrateAuthTokensFromCookieSession } from "@/shared/api/backendFetch";
import type { CurrentUser } from "@/shared/auth/currentUser";
import { fetchCurrentUser } from "@/shared/auth/fetchCurrentUser";
import { navigateAfterAuth } from "@/shared/auth/navigateAfterAuth";
import { resolvePostAuthDestination } from "@/shared/auth/resolvePostAuthDestination";
import { setSessionMarker } from "@/shared/auth/tokenStorage";
import { ErrorScreen } from "@/shared/layout/ErrorScreen";
import { LoadingScreen } from "@/shared/layout/LoadingScreen";

type AuthCallbackClientProps = Readonly<{
  code: string | null;
  error: string | null;
  newUser: string | null;
  profileComplete: string | null;
}>;

const LOGIN_ENTRY_DIRECT_PATH = "/onboarding?step=entry";

function parseBooleanParam(value: string | null) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function resolveDestination(newUser: string | null, user: CurrentUser): string {
  return resolvePostAuthDestination({
    authSource: "social",
    newUser: parseBooleanParam(newUser),
    profileComplete: user.profileComplete,
  });
}

export function AuthCallbackClient({
  code,
  error,
  newUser,
  profileComplete,
}: AuthCallbackClientProps) {
  const router = useRouter();
  const [callbackFailed, setCallbackFailed] = useState(false);

  useEffect(() => {
    if (error === "user_cancelled") {
      router.replace(LOGIN_ENTRY_DIRECT_PATH);
      return undefined;
    }
    if (error) return undefined;

    let mounted = true;

    async function completeAuth() {
      setCallbackFailed(false);

      await hydrateAuthTokensFromCookieSession().catch(() => false);
      const user = await fetchCurrentUser().catch(() => null);
      if (!mounted) return;

      if (!user) {
        // 인증이 정상 동작하지 않은 경우. 폴백 라우팅 대신 에러 화면을 보여준다.
        setCallbackFailed(true);
        return;
      }

      // 다음 진입(`/`) 에서 서버 사이드 fallback 결정을 위해 세션 마커 쿠키를 둔다.
      setSessionMarker();
      navigateAfterAuth(router, resolveDestination(newUser, user));
    }

    void completeAuth();

    return () => {
      mounted = false;
    };
  }, [code, error, newUser, profileComplete, router]);

  if (error === "user_cancelled") {
    return <LoadingScreen />;
  }

  if (error || callbackFailed) {
    return (
      <ErrorScreen
        homeHref={LOGIN_ENTRY_DIRECT_PATH}
        homeLabel="로그인 화면으로"
        onRetry={() => router.replace(LOGIN_ENTRY_DIRECT_PATH)}
      />
    );
  }

  return <LoadingScreen />;
}
