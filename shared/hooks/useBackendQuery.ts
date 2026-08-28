"use client";

import { useCallback, useEffect, useState } from "react";

type QueryState<T> = Readonly<{
  data: T | null;
  error: unknown;
  hasLoaded: boolean;
  isLoading: boolean;
}>;

export type BackendQueryResult<T> = Readonly<{
  data: T | null;
  error: unknown;
  /** 요청이 진행 중이다. */
  isLoading: boolean;
  /** 아직 한 번도 값을 받지 못했다. 스켈레톤을 보여줄지 판단하는 기준이다. */
  isInitialLoading: boolean;
  refetch: () => void;
}>;

const INITIAL_STATE = {
  data: null,
  error: null,
  hasLoaded: false,
  isLoading: true,
} as const;

/**
 * 인증이 필요한 조회 요청 하나를 클라이언트에서 부른다.
 *
 * <p>이 앱의 인증 토큰은 localStorage 와 HttpOnly 쿠키에 있어 서버 컴포넌트에서 읽을 수 없다.
 * 그래서 금융 데이터 조회는 전부 클라이언트에서 일어난다.
 *
 * <p>실패해도 이전 데이터를 지우지 않는다. 지우면 화면이 스켈레톤으로 되돌아갔다가 다시
 * 채워지는데, 보고 있던 잔액이 사라졌다 나타나는 것은 금융 앱에서 특히 불안하게 읽힌다.
 * 대신 호출부가 {@link BackendQueryResult.error} 로 "최신이 아닐 수 있음" 을 알린다.
 *
 * <p>{@code fetcher} 는 {@code useCallback} 으로 감싸서 넘긴다. 매 렌더마다 새 함수가
 * 들어오면 요청이 무한히 반복된다.
 */
export function useBackendQuery<T>(
  fetcher: () => Promise<T>,
): BackendQueryResult<T> {
  const [state, setState] = useState<QueryState<T>>(INITIAL_STATE);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((data) => {
        if (cancelled) return;
        setState({ data, error: null, hasLoaded: true, isLoading: false });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState((previous) => ({
          ...previous,
          error,
          hasLoaded: true,
          isLoading: false,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, reloadToken]);

  const refetch = useCallback(() => {
    setState((previous) => ({ ...previous, isLoading: true }));
    setReloadToken((token) => token + 1);
  }, []);

  return {
    data: state.data,
    error: state.error,
    isInitialLoading: state.isLoading && !state.hasLoaded,
    isLoading: state.isLoading,
    refetch,
  };
}
