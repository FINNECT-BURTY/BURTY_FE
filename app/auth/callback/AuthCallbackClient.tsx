"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ErrorScreen } from "@/shared/layout/ErrorScreen";
import { LoadingScreen } from "@/shared/layout/LoadingScreen";

type AuthCallbackClientProps = Readonly<{
  error: string | null;
  newUser: string | null;
}>;

type ErrorCopy = Readonly<{
  title: string;
  description: string;
}>;

const ERROR_COPY: Record<string, ErrorCopy> = {
  state_expired: {
    title: "로그인 세션이 만료됐어요",
    description: "보안을 위해 일정 시간이 지나면 자동으로 만료돼요.\n다시 시도해 주세요.",
  },
  user_cancelled: {
    title: "로그인이 취소됐어요",
    description: "다시 시도하시려면 아래 버튼을 눌러주세요.",
  },
  invalid_code: {
    title: "잘못된 로그인 정보예요",
    description: "다시 한 번 시도해 주세요.",
  },
  invalid_request: {
    title: "잘못된 요청이에요",
    description: "다시 한 번 시도해 주세요.",
  },
  missing_code: {
    title: "잘못된 로그인 정보예요",
    description: "다시 한 번 시도해 주세요.",
  },
  unsupported_provider: {
    title: "지원하지 않는 로그인이에요",
    description: "다른 방법으로 로그인해 주세요.",
  },
  provider_error: {
    title: "로그인 제공자 응답 오류",
    description: "잠시 후 다시 시도해 주세요.",
  },
  provider_unavailable: {
    title: "로그인 서버가 일시 점검 중이에요",
    description: "잠시 후 다시 시도해 주세요.",
  },
  invalid_token: {
    title: "인증 토큰이 유효하지 않아요",
    description: "다시 로그인해 주세요.",
  },
  forbidden: {
    title: "보안 이슈가 감지됐어요",
    description: "다시 로그인해 주세요.",
  },
  internal_error: {
    title: "일시적인 오류가 발생했어요",
    description: "잠시 후 다시 시도해 주세요.",
  },
};

const LOGIN_ENTRY_PATH = "/onboarding";
const LOGIN_ENTRY_DIRECT_PATH = "/onboarding?step=entry";

function resolveErrorCopy(code: string | null | undefined): ErrorCopy {
  if (!code) return ERROR_COPY.internal_error;
  return ERROR_COPY[code] ?? {
    title: "로그인을 완료하지 못했어요",
    description: "잠시 후 다시 시도해 주세요.",
  };
}

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
    return (
      <LoadingScreen
        description="잠시만 기다려 주세요"
        title="로그인 화면으로 이동 중이에요"
      />
    );
  }

  if (error) {
    const copy = resolveErrorCopy(error);
    return (
      <ErrorScreen
        description={copy.description}
        headerTitle="오류 발생"
        homeHref={LOGIN_ENTRY_DIRECT_PATH}
        homeLabel="로그인 화면으로"
        onRetry={() => router.replace(LOGIN_ENTRY_DIRECT_PATH)}
        retryLabel="다시 시도하기"
        title={copy.title}
      />
    );
  }

  return (
    <LoadingScreen
      description="잠시만 기다려 주세요"
      title="로그인 정보를 정리하고 있어요"
    />
  );
}
