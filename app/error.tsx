"use client";

import { useRouter } from "next/navigation";

import { ErrorScreen } from "@/shared/layout/ErrorScreen";

type ErrorPageProps = Readonly<{
  error: Error & { digest?: string };
  unstable_retry: () => void;
}>;

export default function Error({ unstable_retry }: ErrorPageProps) {
  const router = useRouter();

  return (
    <ErrorScreen
      description="연결 상태를 확인한 뒤 다시 시도해주세요"
      headerTitle="오류 발생"
      homeLabel="홈으로 돌아가기"
      onBack={() => router.back()}
      onRetry={unstable_retry}
      retryLabel="다시 시도하기"
      title="돈 흐름을 불러오지 못했어요"
    />
  );
}
