import { describe, expect, it } from "vitest";

import {
  formatCompactWon,
  formatKoreanDate,
  formatMonthDay,
  formatRelativeTime,
  formatSignedWon,
  formatWon,
} from "@/shared/ui/money";

/**
 * 금액·날짜 표기 계약.
 *
 * <p>같은 값이 화면마다 다르게 보이면 그 자체로 신뢰 문제가 된다. 여기서 고정한 규칙이
 * 홈·자산·솔루션·마이페이지 전부에 적용된다.
 */
describe("formatWon", () => {
  it("천 단위를 끊고 원을 붙인다", () => {
    expect(formatWon(1234000)).toBe("1,234,000원");
    expect(formatWon(0)).toBe("0원");
  });

  it("소수는 반올림한다 — 백엔드 assets/summary 는 double 을 준다", () => {
    expect(formatWon(1234.4)).toBe("1,234원");
    expect(formatWon(1234.6)).toBe("1,235원");
  });

  it("음수도 그대로 표기한다", () => {
    expect(formatWon(-168000)).toBe("-168,000원");
  });
});

describe("formatSignedWon", () => {
  it("방향이 핵심인 목록에서는 부호를 항상 붙인다", () => {
    expect(formatSignedWon(2650000)).toBe("+2,650,000원");
    expect(formatSignedWon(-520000)).toBe("-520,000원");
  });

  it("0 에는 부호를 붙이지 않는다 — +0원 은 뜻이 없다", () => {
    expect(formatSignedWon(0)).toBe("0원");
  });
});

describe("formatCompactWon", () => {
  it("만·억 단위로 줄인다", () => {
    expect(formatCompactWon(300000)).toBe("30만");
    expect(formatCompactWon(15000)).toBe("1.5만");
    expect(formatCompactWon(230000000)).toBe("2.3억");
  });

  it("만 미만은 그대로 둔다", () => {
    expect(formatCompactWon(9999)).toBe("9,999");
  });

  it("음수 부호를 유지한다 — 차트 축에서 마이너스 구간이 사라지면 안 된다", () => {
    expect(formatCompactWon(-300000)).toBe("-30만");
  });
});

describe("날짜 파싱", () => {
  /**
   * 백엔드는 LocalDate 를 타임존 없는 "2026-08-28" 로 보낸다.
   *
   * <p>{@code new Date("2026-08-28")} 은 UTC 자정으로 해석되어 KST 에서 8월 27일이 된다.
   * 이 하루 차이가 "25일에 부족" 을 "24일에 부족" 으로 만든다.
   */
  it("날짜만 오는 값을 로컬 날짜로 읽는다", () => {
    expect(formatMonthDay("2026-08-28")).toBe("8.28");
    expect(formatKoreanDate("2026-08-28")).toBe("8월 28일");
  });

  it("연초·연말 경계에서도 밀리지 않는다", () => {
    expect(formatKoreanDate("2026-01-01")).toBe("1월 1일");
    expect(formatKoreanDate("2026-12-31")).toBe("12월 31일");
  });

  it("해석할 수 없는 값은 원문을 돌려준다 — 화면에 Invalid Date 를 띄우지 않는다", () => {
    expect(formatMonthDay("")).toBe("");
    expect(formatKoreanDate("nonsense")).toBe("nonsense");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-08-28T12:00:00");

  it("알림 목록에서 최근일수록 짧게 읽힌다", () => {
    expect(formatRelativeTime("2026-08-28T11:59:40", now)).toBe("방금");
    expect(formatRelativeTime("2026-08-28T11:57:00", now)).toBe("3분 전");
    expect(formatRelativeTime("2026-08-28T07:00:00", now)).toBe("5시간 전");
    expect(formatRelativeTime("2026-08-25T12:00:00", now)).toBe("3일 전");
  });

  it("일주일이 넘으면 날짜로 보여준다 — 30일 전 은 언제인지 알 수 없다", () => {
    expect(formatRelativeTime("2026-07-20T12:00:00", now)).toBe("7월 20일");
  });

  it("빈 값에서 깨지지 않는다 — sentAt 은 null 로 올 수 있다", () => {
    expect(formatRelativeTime("", now)).toBe("");
  });
});
