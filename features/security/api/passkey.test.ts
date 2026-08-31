import { describe, expect, it } from "vitest";

import { describePasskeyError, PasskeyError } from "@/features/security/api/passkey";

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
