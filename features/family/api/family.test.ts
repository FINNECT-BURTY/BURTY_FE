import { describe, expect, it } from "vitest";

import {
  approvalStateLabel,
  classifyApproval,
  remainingLabel,
} from "@/features/family/api/family";

describe("classifyApproval", () => {
  it("서버 상태를 화면 상태로 옮긴다", () => {
    expect(classifyApproval("APPROVED")).toBe("approved");
    expect(classifyApproval("REJECTED")).toBe("rejected");
    expect(classifyApproval("EXPIRED")).toBe("expired");
    expect(classifyApproval("PENDING")).toBe("pending");
  });

  /**
   * 모르는 상태를 승인·거절로 단정하면 안 된다. 보호자에게 "이미 처리됐다" 고 말하면
   * 아직 막을 수 있는 이체를 그냥 지나친다. 판단이 서지 않으면 대기로 둔다.
   */
  it("모르는 상태는 대기로 둔다", () => {
    expect(classifyApproval("SOMETHING_NEW")).toBe("pending");
    expect(classifyApproval(null)).toBe("pending");
    expect(classifyApproval(undefined)).toBe("pending");
  });

  it("모든 상태에 사용자가 읽을 문구가 있다", () => {
    for (const state of ["approved", "expired", "pending", "rejected"] as const) {
      expect(approvalStateLabel(state)).not.toBe("");
    }
  });
});

describe("remainingLabel", () => {
  const now = new Date("2026-08-28T10:00:00Z");

  it("한 시간 안이면 분으로 알린다", () => {
    expect(remainingLabel("2026-08-28T10:30:00Z", now)).toBe("30분 남음");
  });

  it("하루 안이면 시간으로 알린다", () => {
    expect(remainingLabel("2026-08-28T15:00:00Z", now)).toBe("5시간 남음");
  });

  it("하루가 넘으면 일로 알린다", () => {
    expect(remainingLabel("2026-08-30T10:00:00Z", now)).toBe("2일 남음");
  });

  /** 이미 지난 기한을 "0분 남음" 으로 보여주면 아직 승인할 수 있다고 오해한다. */
  it("기한이 지났으면 그렇게 말한다", () => {
    expect(remainingLabel("2026-08-28T09:00:00Z", now)).toBe("기한이 지났어요");
  });

  it("기한이 없거나 읽을 수 없으면 아무것도 말하지 않는다", () => {
    expect(remainingLabel(null, now)).toBe("");
    expect(remainingLabel("어제", now)).toBe("");
  });
});
