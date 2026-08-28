"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { Skeleton } from "@/shared/ui/Skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/StateMessage";

type SettingsScreenShellProps = Readonly<{
  children: ReactNode;
  /** 목록이 비었을 때 보여줄 문구. */
  emptyDescription?: string;
  emptyTitle?: string;
  errorMessage?: string;
  isEmpty: boolean;
  isInitialLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  /** 목록 위에 붙는 설명. 이 화면에서 무엇을 바꾸면 어디에 영향이 가는지 알린다. */
  description?: string;
  title: string;
}>;

/**
 * 마이페이지 하위 설정 화면의 공통 틀.
 *
 * <p>헤더·로딩·빈 상태·오류 처리를 화면마다 다시 조합하면 같은 상황에서 다르게 보인다.
 * 설정 화면은 사용자가 자기 데이터를 지우거나 끊는 곳이라 상태 표시가 특히 일관돼야 한다.
 */
export function SettingsScreenShell({
  children,
  description,
  emptyDescription,
  emptyTitle = "아직 등록된 항목이 없어요",
  errorMessage = "정보를 불러오지 못했어요",
  hasError,
  isEmpty,
  isInitialLoading,
  onRetry,
  title,
}: SettingsScreenShellProps) {
  const router = useRouter();

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <Header
        leftSlot={<HeaderBackButton onClick={() => router.back()} />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title={title}
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
        {description ? (
          <p className="text-body-md mb-4 text-grayscale-800">{description}</p>
        ) : null}

        {isInitialLoading ? (
          <ul className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <li
                className="rounded-2xl border border-grayscale-100 bg-background px-5 py-5"
                key={index}
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-24" />
              </li>
            ))}
          </ul>
        ) : hasError && isEmpty ? (
          <ErrorState message={errorMessage} onRetry={onRetry} />
        ) : isEmpty ? (
          <EmptyState description={emptyDescription} title={emptyTitle} />
        ) : (
          children
        )}
      </section>
    </main>
  );
}
