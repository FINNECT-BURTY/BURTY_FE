import { beforeEach, describe, expect, it, vi } from "vitest";


vi.mock("@/shared/api/backendFetch", () => ({
  backendFetch: vi.fn(),
}));

const { backendFetch } = await import("@/shared/api/backendFetch");
const mocked = vi.mocked(backendFetch);

// 정적 import 로 가져오면 vitest 가 모의 함수의 동기 예외를 미처리 오류로도 보고해
// 통과해야 할 테스트가 실패로 잡힌다. 모의가 자리잡은 뒤 불러온다.
const { ApiError, describeApiError, fetchApiData, fetchApiList } = await import(
  "@/shared/api/apiResponse"
);
type ApiErrorType = InstanceType<typeof ApiError>;

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

/**
 * 백엔드 응답 봉투 해석.
 *
 * <p>모든 금융 데이터가 이 함수를 지난다. 여기서 성공·실패를 잘못 가르면 화면 전체가
 * 잘못된 상태를 보여준다.
 */
describe("fetchApiData", () => {
  beforeEach(() => mocked.mockReset());

  it("성공 응답의 data 를 꺼낸다", async () => {
    mocked.mockResolvedValue(response(200, { success: true, data: { totalAsset: 100 } }));
    await expect(fetchApiData("/x")).resolves.toEqual({ totalAsset: 100 });
  });

  it("HTTP 200 이어도 success:false 면 실패로 본다", async () => {
    // 백엔드에 이런 응답이 실재한다. 상태코드만 보면 오류를 정상으로 처리하게 된다.
    mocked.mockResolvedValue(response(200, { success: false, message: "한도 초과" }));
    await expect(fetchApiData("/x")).rejects.toBeInstanceOf(ApiError);
  });

  it("data 가 null 이면 null 을 돌려준다 — 값 없음과 실패는 다르다", async () => {
    // 계좌 미연동, 이번 달 일정 없음처럼 빈 상태가 정상인 화면이 많다.
    mocked.mockResolvedValue(response(200, { success: true, data: null }));
    await expect(fetchApiData("/x")).resolves.toBeNull();
  });

  it("401 은 unauthorized 로 분류한다", async () => {
    mocked.mockResolvedValue(response(401, { success: false }));
    await expect(fetchApiData("/x")).rejects.toMatchObject({ reason: "unauthorized" });
  });

  it("단계 인증이 필요한 403 은 로그인 만료와 구분한다", async () => {
    // 구분하지 않으면 "다시 로그인해주세요" 가 떠서, 멀쩡한 로그인에 사용자가
    // 다시 로그인하려 든다. 연동 해제와 세션 관리 결함이 이 문구에 가려져 있었다.
    mocked.mockResolvedValue(
      response(403, {
        success: false,
        errorCode: "2006",
        message: "추가 본인확인이 필요합니다",
      }),
    );
    await expect(fetchApiData("/x")).rejects.toMatchObject({ reason: "step-up" });
  });

  it("그 밖의 403 은 여전히 로그인 문제로 본다", async () => {
    mocked.mockResolvedValue(response(403, { success: false }));
    await expect(fetchApiData("/x")).rejects.toMatchObject({ reason: "unauthorized" });
  });

  it("404 는 not-found 로 분류한다", async () => {
    mocked.mockResolvedValue(response(404, { success: false }));
    await expect(fetchApiData("/x")).rejects.toMatchObject({ reason: "not-found" });
  });

  it("본문이 JSON 이 아니어도 깨지지 않는다", async () => {
    mocked.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error("not json");
      },
    } as unknown as Response);
    await expect(fetchApiData("/x")).rejects.toMatchObject({ reason: "server" });
  });
});

describe("fetchApiList", () => {
  beforeEach(() => mocked.mockReset());

  it("null 을 빈 배열로 정규화한다 — 목록 화면이 undefined 를 만나면 안 된다", async () => {
    mocked.mockResolvedValue(response(200, { success: true, data: null }));
    await expect(fetchApiList("/x")).resolves.toEqual([]);
  });
});

describe("describeApiError", () => {
  it("서버 메시지를 그대로 노출하지 않는다", () => {
    const error = new ApiError("server", "NullPointerException at line 42");
    expect(describeApiError(error)).toBe("잠시 후 다시 시도해주세요");
  });

  it("원인별로 사용자가 할 수 있는 행동을 알려준다", () => {
    expect(describeApiError(new ApiError("network", ""))).toContain("네트워크");
    expect(describeApiError(new ApiError("unauthorized", ""))).toContain("로그인");
  });

  it("단계 인증은 로그인과 다른 안내를 준다", () => {
    // 로그인은 멀쩡한데 "다시 로그인해주세요" 가 뜨면 사용자가 엉뚱한 일을 한다.
    const message = describeApiError(new ApiError("step-up", ""));
    expect(message).toContain("본인 확인");
    expect(message).not.toContain("로그인");
  });

  it("ApiError 가 아닌 값도 안전하게 처리한다", () => {
    expect(describeApiError(new Error("boom"))).toBe("잠시 후 다시 시도해주세요");
    expect(describeApiError(undefined)).toBe("잠시 후 다시 시도해주세요");
  });
});

/**
 * 네트워크 실패는 별도 블록에 둔다.
 *
 * <p>위 블록의 {@code beforeEach} 가 모의를 초기화한 상태에서 동기 예외를 던지면,
 * vitest 가 그 예외를 미처리 오류로도 보고해 통과해야 할 테스트가 실패로 잡힌다.
 */
describe("네트워크 실패 분류", () => {
  it("서버 오류와 구분한다", async () => {
    mocked.mockImplementation(async () => {
      throw new TypeError("Failed to fetch");
    });

    let caught: unknown = null;
    try {
      await fetchApiData("/x");
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiErrorType).reason).toBe("network");
  });
});
