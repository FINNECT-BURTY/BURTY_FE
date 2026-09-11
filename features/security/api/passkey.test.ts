import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  describePasskeyError,
  PasskeyError,
  registerPasskey,
} from "@/features/security/api/passkey";

vi.mock("@/shared/api/apiResponse", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/api/apiResponse")>()),
  fetchApiData: vi.fn(),
}));

const { ApiError, fetchApiData } = await import("@/shared/api/apiResponse");
const mockedFetch = vi.mocked(fetchApiData);

/**
 * 등록 실패 문구.
 *
 * <p>취소·중복·시간초과는 사용자가 다음에 할 일이 각각 다르다. 하나로 뭉뚱그리면
 * 이미 등록된 사용자가 계속 다시 시도하거나, 취소한 사용자가 기기 문제로 오해한다.
 */
describe("describePasskeyError", () => {
  it("원인마다 다른 문구를 준다", () => {
    const reasons = [
      "cancelled",
      "duplicate",
      "failed",
      "rejected",
      "timeout",
      "unavailable",
      "unsupported",
    ] as const;

    const messages = reasons.map((reason) =>
      describePasskeyError(new PasskeyError(reason, "")),
    );

    expect(new Set(messages).size).toBe(reasons.length);
    for (const message of messages) expect(message).not.toBe("");
  });

  it("이미 등록된 기기라고 알린다", () => {
    expect(describePasskeyError(new PasskeyError("duplicate", ""))).toContain(
      "이미",
    );
  });

  /** 서버 내부 문구를 그대로 노출하지 않는다. 사용자에게 의미가 없고 구조를 드러낸다. */
  it("모르는 오류는 일반 문구로 덮는다", () => {
    expect(describePasskeyError(new Error("NullPointerException at ..."))).toBe(
      "등록에 실패했어요",
    );
    expect(describePasskeyError("문자열")).toBe("등록에 실패했어요");
  });
});

/**
 * 등록이 애초에 불가능한 계정.
 *
 * <p>예전에는 이 계정도 생체인증까지 마친 뒤 "등록이 확인되지 않았어요" 로 끝났다. 기기나
 * 인증기 문제로 읽혀 계속 다시 시도하게 된다. 챌린지 단계에서 거부되면 기기를 부르지 않는다.
 */
describe("registerPasskey — 등록할 수 없는 계정", () => {
  beforeEach(() => mockedFetch.mockReset());

  it("챌린지 단계에서 거부되면 기기를 부르지 않고 그 이유를 알린다", async () => {
    mockedFetch.mockRejectedValueOnce(
      new ApiError("server", "이 계정은 패스키를 등록할 수 없습니다", {
        errorCode: "2005",
        status: 400,
      }),
    );

    const error = await registerPasskey("demo-user", "체험").catch((e: unknown) => e);

    // 기기(브라우저 WebAuthn)까지 갔다면 이 테스트 환경에서는 "unsupported" 가 나온다.
    expect(error).toBeInstanceOf(PasskeyError);
    expect((error as PasskeyError).reason).toBe("unavailable");
    expect(describePasskeyError(error)).toBe("이 계정에서는 패스키를 등록할 수 없어요");
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it("다른 이유로 챌린지를 못 받으면 예전처럼 일반 실패다", async () => {
    mockedFetch.mockRejectedValueOnce(
      new ApiError("server", "요청이 실패했습니다", { status: 500 }),
    );

    const error = await registerPasskey("1", "사용자").catch((e: unknown) => e);

    expect((error as PasskeyError).reason).toBe("failed");
  });
});
