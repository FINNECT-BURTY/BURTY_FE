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
      onBack={() => router.back()}
      onRetry={unstable_retry}
    />
  );
}
