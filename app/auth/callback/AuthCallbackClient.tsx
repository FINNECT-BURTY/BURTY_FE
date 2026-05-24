"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { CurrentUser } from "@/shared/auth/currentUser";
import { fetchCurrentUser } from "@/shared/auth/fetchCurrentUser";
import { ErrorScreen } from "@/shared/layout/ErrorScreen";
import { LoadingScreen } from "@/shared/layout/LoadingScreen";

type AuthCallbackClientProps = Readonly<{
  code: string | null;
  error: string | null;
  newUser: string | null;
  profileComplete: string | null;
}>;

const LOGIN_ENTRY_PATH = "/onboarding";
const LOGIN_ENTRY_DIRECT_PATH = "/onboarding?step=entry";
const ONBOARDING_AGREEMENT_PATH = `${LOGIN_ENTRY_PATH}?step=agreement&newUser=true`;

function parseBooleanParam(value: string | null) {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

/**
 * BE BFF 콜백 후 최종 라우팅을 결정한다.
 * - newUser=true 이거나 profileComplete=false 인 경우 무조건 온보딩으로 보낸다.
 * - 그 외에는 /auth/me 응답의 profileComplete 가 명시적으로 true 일 때만 홈으로 진입한다.
 *   (profileComplete 가 없거나 false 이면 안전하게 온보딩으로 보낸다.)
 */
function resolveDestination(
  newUser: string | null,
  profileComplete: string | null,
  user: CurrentUser,
): string {
  if (newUser === "true") return ONBOARDING_AGREEMENT_PATH;

  const completedFromParam = parseBooleanParam(profileComplete);
  if (completedFromParam === false) return ONBOARDING_AGREEMENT_PATH;

  if (user.profileComplete === true) return "/";

  return ONBOARDING_AGREEMENT_PATH;
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

      const user = await fetchCurrentUser().catch(() => null);
      if (!mounted) return;

      if (!user) {
        // 인증이 정상 동작하지 않은 경우. 폴백 라우팅 대신 에러 화면을 보여준다.
        setCallbackFailed(true);
        return;
      }

      router.replace(resolveDestination(newUser, profileComplete, user));
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
