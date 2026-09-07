"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  categoryLabel,
  fetchTransactions,
  groupByDate,
  isCategoryTrusted,
  signedAmount,
  transactionDirection,
  type TransactionItem,
  type TransactionPage,
  transactionTitle,
} from "@/features/transaction/api/transactions";
import { describeApiError } from "@/shared/api/apiResponse";
import { Header, HeaderBackButton } from "@/shared/layout/Header";
import { formatKoreanDate, formatSignedWon } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/Skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/StateMessage";

export function TransactionScreen() {
  const router = useRouter();

  const [items, setItems] = useState<readonly TransactionItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const apply = useCallback((result: TransactionPage, append: boolean) => {
    // 이어붙일 때 이전 목록을 통째로 갈아끼우지 않는다. 스크롤 위치가 튄다.
    setItems((previous) =>
      append ? [...previous, ...result.content] : result.content,
    );
    setPage(result.page);
    setHasNext(result.hasNext);
    setTotal(result.totalElements);
  }, []);

  // 첫 페이지. 효과 본문에서 곧바로 상태를 바꾸지 않고 응답 콜백에서만 바꾼다 —
  // 이 프로젝트의 다른 조회 화면(`useBackendQuery`)과 같은 방식이다.
  useEffect(() => {
    let cancelled = false;

    fetchTransactions(0)
      .then((result) => {
        if (cancelled) return;
        apply(result, false);
        setError(null);
        setHasLoaded(true);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(describeApiError(cause));
        setHasLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [apply, reloadToken]);

  const retry = () => {
    setError(null);
    setHasLoaded(false);
    setReloadToken((token) => token + 1);
  };

  const loadMore = async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      apply(await fetchTransactions(page + 1), true);
    } catch (cause) {
      setError(describeApiError(cause));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const groups = useMemo(() => groupByDate(items), [items]);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <Header
        leftSlot={<HeaderBackButton onClick={() => router.back()} />}
        rightSlot={<div aria-hidden="true" className="size-10" />}
        title="거래내역"
      />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-4">
        {!hasLoaded ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                className="rounded-2xl border border-grayscale-100 bg-background px-5 py-5"
                key={index}
              >
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-2 h-3 w-16" />
              </div>
            ))}
          </div>
        ) : error && items.length === 0 ? (
          <ErrorState
            message="거래내역을 불러오지 못했어요"
            onRetry={retry}
          />
        ) : items.length === 0 ? (
          <EmptyState
            description="계좌를 연동하면 거래내역을 모아서 보여드려요"
            title="거래내역이 없어요"
          />
        ) : (
          <>
            <p className="text-caption tabular-nums text-grayscale-600">
              총 {total.toLocaleString("ko-KR")}건
            </p>

            {groups.map((group) => (
              <section className="mt-5" key={group.date}>
                {/* 날짜와 그날 합계를 함께 둔다. 목록의 주된 질문은 "그날 얼마 썼나" 다. */}
                <div className="flex items-baseline justify-between">
                  <h2 className="text-title-xs text-grayscale-900">
                    {formatKoreanDate(group.date)}
                  </h2>
                  <span className="text-caption tabular-nums text-grayscale-600">
                    {formatSignedWon(group.total)}
                  </span>
                </div>

                <ul className="mt-2 space-y-2">
                  {group.items.map((item) => (
                    <li key={item.txId}>
                      <TransactionRow item={item} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {error ? (
              <p className="text-body-md mt-4 text-center text-red" role="alert">
                {error}
              </p>
            ) : null}

            {hasNext ? (
              <button
                aria-busy={isLoadingMore}
                className="text-body-md mt-6 h-12 w-full rounded-2xl border border-grayscale-200 bg-background text-grayscale-800 active:bg-grayscale-100"
                disabled={isLoadingMore}
                onClick={() => void loadMore()}
                type="button"
              >
                {isLoadingMore ? "불러오는 중..." : "더보기"}
              </button>
            ) : (
              <p className="text-caption mt-6 text-center text-grayscale-500">
                모두 불러왔어요
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function TransactionRow({ item }: Readonly<{ item: TransactionItem }>) {
  const direction = transactionDirection(item);
  const category = categoryLabel(item);

  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl border border-grayscale-100 bg-background px-5 py-4">
      <div className="min-w-0">
        <p className="text-title-xs truncate text-grayscale-1000">
          {transactionTitle(item)}
        </p>
        <p className="text-caption mt-0.5 flex items-center gap-1.5 text-grayscale-600">
          {category ? <span>{category}</span> : null}
          {/*
            자동 분류가 확실하지 않으면 카테고리를 감추는 대신 그 사실을 알린다.
            낮은 신뢰도를 확정된 것처럼 보여주면 잘못된 분류를 근거로 지출을 판단한다.
          */}
          {!isCategoryTrusted(item) ? (
            <span className="text-grayscale-500">분류 확인 필요</span>
          ) : null}
        </p>
      </div>

      {/* 수입만 초록으로 강조한다. 지출을 빨강으로 칠하면 평범한 소비가 전부 경고가 된다. */}
      <p
        className={`text-body-md tabular-nums shrink-0 ${
          direction === "in" ? "text-green" : "text-grayscale-1000"
        }`}
      >
        {formatSignedWon(signedAmount(item))}
      </p>
    </article>
  );
}
