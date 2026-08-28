"use client";

import Image from "next/image";

/**
 * 카드 안에서 쓰는 빈 상태 / 오류 상태.
 *
 * <p>화면 전체를 덮는 `ErrorScreen` 과 다르다. 한 섹션만 실패했을 때 화면 전체를
 * 오류로 덮으면 멀쩡히 불러온 잔액까지 사라진다. 실패한 카드만 이 컴포넌트로 바꾼다.
 */

export function EmptyState({
  className = "",
  description,
  title,
}: Readonly<{
  className?: string;
  description?: string;
  title: string;
}>) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-10 text-center ${className}`}
    >
      <p className="text-body-lg text-grayscale-800">{title}</p>
      {description ? (
        <p className="text-body-md mt-1 text-grayscale-600">{description}</p>
      ) : null}
    </div>
  );
}

export function ErrorState({
  className = "",
  message,
  onRetry,
}: Readonly<{
  className?: string;
  message: string;
  onRetry?: () => void;
}>) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-8 text-center ${className}`}
      role="alert"
    >
      <Image
        alt=""
        aria-hidden="true"
        height={20}
        src="/icons/main/warning-orange.svg"
        width={20}
      />
      <p className="text-body-md mt-2 text-grayscale-800">{message}</p>
      {onRetry ? (
        <button
          className="text-body-md mt-3 rounded-full border border-grayscale-200 bg-background px-4 py-2 text-grayscale-900 active:bg-grayscale-100"
          onClick={onRetry}
          type="button"
        >
          다시 시도
        </button>
      ) : null}
    </div>
  );
}

/**
 * 이미 값을 보여주고 있는데 갱신만 실패한 경우.
 *
 * <p>보고 있던 잔액을 지우지 않는다. 대신 이 값이 최신이 아닐 수 있다는 것을 알린다 —
 * 오래된 잔액을 최신인 것처럼 두는 쪽이 더 위험하다.
 */
export function StaleNotice({
  className = "",
  onRetry,
}: Readonly<{ className?: string; onRetry?: () => void }>) {
  return (
    <p
      className={`text-caption flex items-center gap-2 text-grayscale-600 ${className}`}
      role="status"
    >
      <span>최신 정보를 불러오지 못했어요</span>
      {onRetry ? (
        <button
          className="underline underline-offset-2"
          onClick={onRetry}
          type="button"
        >
          새로고침
        </button>
      ) : null}
    </p>
  );
}
