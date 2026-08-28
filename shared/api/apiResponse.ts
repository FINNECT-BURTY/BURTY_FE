import { backendFetch } from "@/shared/api/backendFetch";

/**
 * BURTY API 공통 응답 봉투.
 *
 * 백엔드 `ApiResponse<T>` 와 1:1 이다. 성공 여부가 HTTP 상태와 본문 양쪽에 있으므로
 * 둘 다 확인해야 한다 — 200 이면서 `success: false` 인 응답이 존재한다.
 */
export type ApiEnvelope<T> = Readonly<{
  success?: boolean;
  message?: string;
  data?: T | null;
  errorCode?: string;
}>;

/** 화면이 구분해서 다뤄야 하는 실패 원인. */
export type ApiFailureReason =
  | "network"
  | "unauthorized"
  | "not-found"
  | "server";

export class ApiError extends Error {
  readonly reason: ApiFailureReason;
  readonly errorCode?: string;
  readonly status?: number;

  constructor(
    reason: ApiFailureReason,
    message: string,
    options: Readonly<{ errorCode?: string; status?: number }> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.reason = reason;
    this.errorCode = options.errorCode;
    this.status = options.status;
  }
}

function reasonFromStatus(status: number): ApiFailureReason {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404) return "not-found";
  return "server";
}

/**
 * 사용자에게 보여줄 문구.
 *
 * 서버 메시지를 그대로 노출하지 않는다. 금융 서비스에서 내부 오류 문구는
 * 사용자에게 의미가 없고, 시스템 내부 구조를 드러낼 수 있다.
 */
export function describeApiError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "잠시 후 다시 시도해주세요";
  }

  switch (error.reason) {
    case "network":
      return "네트워크 연결을 확인해주세요";
    case "unauthorized":
      return "다시 로그인해주세요";
    case "not-found":
      return "아직 준비된 정보가 없어요";
    default:
      return "잠시 후 다시 시도해주세요";
  }
}

/**
 * 인증이 필요한 GET 요청 하나를 보내고 `data` 를 꺼낸다.
 *
 * `data` 가 null 이면 `null` 을 돌려준다. 호출부가 "값 없음" 과 "실패" 를
 * 구분할 수 있어야 하기 때문이다 — 아직 연동하지 않은 계좌, 이번 달 일정 없음처럼
 * 빈 상태가 정상인 화면이 많다.
 */
export async function fetchApiData<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  let response: Response;

  try {
    response = await backendFetch(path, init);
  } catch {
    throw new ApiError("network", "요청을 보내지 못했습니다");
  }

  const payload = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    throw new ApiError(
      reasonFromStatus(response.status),
      payload?.message ?? "요청이 실패했습니다",
      { errorCode: payload?.errorCode, status: response.status },
    );
  }

  // HTTP 200 이어도 봉투가 실패를 말하면 실패다.
  if (payload?.success !== true) {
    throw new ApiError("server", payload?.message ?? "요청이 실패했습니다", {
      errorCode: payload?.errorCode,
      status: response.status,
    });
  }

  return payload.data ?? null;
}

/** 목록 응답 전용. `null` 을 빈 배열로 정규화한다. */
export async function fetchApiList<T>(
  path: string,
  init?: RequestInit,
): Promise<readonly T[]> {
  const data = await fetchApiData<T[]>(path, init);
  return data ?? [];
}
