"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ErrorScreen } from "@/shared/layout/ErrorScreen";
import { LoadingScreen } from "@/shared/layout/LoadingScreen";

type AuthCallbackClientProps = Readonly<{
  error: string | null;
  newUser: string | null;
}>;

const LOGIN_ENTRY_PATH = "/onboarding";
const LOGIN_ENTRY_DIRECT_PATH = "/onboarding?step=entry";

/** BE BFF 콜백 후 신규 유저만 필수 온보딩 플로우로 진입한다. */
function resolveDestination(newUser: string | null): string {
  if (newUser === "true") {
    return `${LOGIN_ENTRY_PATH}?step=agreement&newUser=true`;
  }

  return "/";
}

export function AuthCallbackClient({
  error,
  newUser,
}: AuthCallbackClientProps) {
  const router = useRouter();
  const destination = resolveDestination(newUser);

  useEffect(() => {
    if (error === "user_cancelled") {
      router.replace(LOGIN_ENTRY_DIRECT_PATH);
      return;
    }
    if (error) return;
    router.replace(destination);
  }, [error, destination, router]);

  if (error === "user_cancelled") {
    return <LoadingScreen />;
  }

  if (error) {
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
