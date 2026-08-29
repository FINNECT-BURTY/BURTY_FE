import { describe, expect, it } from "vitest";

import {
  classifyTransfer,
  isAwaitingApproval,
  transferOutcomeDescription,
} from "@/features/transfer/api/transfer";

/**
 * 이체 결과 분류.
 *
 * <p>이 프로젝트에서 가장 중요한 판단이 여기 있다. 은행 응답을 받지 못한 건을 실패로
 * 뭉뚱그리면 사용자가 같은 이체를 다시 보내고, 돈이 두 번 나간다.
 */
describe("classifyTransfer", () => {
  it("실행이 끝난 건만 성공으로 본다", () => {
    expect(classifyTransfer("COMPLETED")).toBe("completed");
    expect(classifyTransfer("EXECUTED")).toBe("completed");
  });

  it("UNKNOWN 을 실패로 분류하지 않는다 — 출금됐을 수 있다", () => {
    expect(classifyTransfer("UNKNOWN")).toBe("unknown");
  });

  it("EXECUTING 도 결과 미확정으로 본다 — 은행 응답을 기다리는 중이다", () => {
    expect(classifyTransfer("EXECUTING")).toBe("unknown");
  });

  it("확정된 실패만 실패로 본다", () => {
    expect(classifyTransfer("FAILED")).toBe("rejected");
    expect(classifyTransfer("CANCELLED")).toBe("rejected");
    expect(classifyTransfer("REVERSED")).toBe("rejected");
  });

  it("진행 중 상태는 처리 중으로 본다", () => {
    expect(classifyTransfer("PENDING")).toBe("pending");
    expect(classifyTransfer("AWAITING_APPROVAL")).toBe("pending");
    expect(classifyTransfer("AUTHORIZED")).toBe("pending");
  });

  it("모르는 상태를 성공이나 실패로 넘기지 않는다", () => {
    // 새 상태가 생겼을 때 조용히 "완료" 로 보이면 사용자가 잘못 판단한다.
    expect(classifyTransfer("SOMETHING_NEW")).toBe("pending");
    expect(classifyTransfer(null)).toBe("pending");
    expect(classifyTransfer(undefined)).toBe("pending");
  });

  it("대소문자를 가리지 않는다", () => {
    expect(classifyTransfer("completed")).toBe("completed");
    expect(classifyTransfer("unknown")).toBe("unknown");
  });
});

describe("transferOutcomeDescription", () => {
  it("결과 미확정에는 다시 보내지 말라고 알린다", () => {
    expect(transferOutcomeDescription("unknown")).toContain("다시 보내지 마세요");
  });

  it("확정 실패에는 돈이 나가지 않았음을 알린다", () => {
    expect(transferOutcomeDescription("rejected")).toContain("빠져나가지 않았어요");
  });
});

describe("isAwaitingApproval", () => {
  it("보호자 승인 대기를 구분한다 — 사용자가 할 일이 다르다", () => {
    expect(isAwaitingApproval("AWAITING_APPROVAL")).toBe(true);
    expect(isAwaitingApproval("PENDING")).toBe(false);
    expect(isAwaitingApproval(null)).toBe(false);
  });
});
