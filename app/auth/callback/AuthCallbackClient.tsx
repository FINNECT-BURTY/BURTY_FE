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

function parseBooleanParam(value: string | null) {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

/** BE BFF 콜백 후 미완료 유저만 필수 온보딩 플로우로 진입한다. */
function resolveDestination(
  newUser: string | null,
  profileComplete: string | null,
  user?: CurrentUser,
): string {
  const completedProfile = parseBooleanParam(profileComplete);

  if (
    newUser === "true" ||
    completedProfile === false ||
    user?.profileComplete === false
  ) {
    return `${LOGIN_ENTRY_PATH}?step=agreement&newUser=true`;
  }

  return "/";
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
    let mounted = true;

    async function completeAuth() {
      if (error) return;
      setCallbackFailed(false);

      const user = await fetchCurrentUser().catch(() => null);
      if (!mounted) return;

      if (!user) {
        const completedProfile = parseBooleanParam(profileComplete);

        if (completedProfile !== null || newUser !== null) {
          router.replace(resolveDestination(newUser, profileComplete));
          return;
        }

        setCallbackFailed(true);
        return;
      }

      router.replace(resolveDestination(newUser, profileComplete, user));
    }

    if (error === "user_cancelled") {
      router.replace(LOGIN_ENTRY_DIRECT_PATH);
      return undefined;
    }
    if (error) return undefined;

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
