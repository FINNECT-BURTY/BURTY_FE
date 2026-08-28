import { describe, expect, it } from "vitest";

import type { CashflowSchedule } from "@/features/finance/api/assetFlow";
import {
  scheduleDateInMonth,
  scheduleDirection,
  signedScheduleAmount,
  toAssetFlowPoints,
} from "@/features/finance/api/assetFlow";

function schedule(overrides: Partial<CashflowSchedule> = {}): CashflowSchedule {
  return {
    scheduleId: "s1",
    label: "월세",
    amount: 520000,
    direction: "OUT",
    dayOfMonth: 16,
    active: true,
    ...overrides,
  };
}

describe("일정 금액과 방향", () => {
  it("백엔드 amount 는 부호 없는 크기이므로 방향으로 부호를 붙인다", () => {
    expect(signedScheduleAmount(schedule({ direction: "OUT" }))).toBe(-520000);
    expect(signedScheduleAmount(schedule({ direction: "IN" }))).toBe(520000);
  });

  it("이미 음수로 온 값도 방향을 따른다 — 부호가 두 번 뒤집히면 안 된다", () => {
    expect(signedScheduleAmount(schedule({ amount: -520000, direction: "OUT" }))).toBe(-520000);
    expect(signedScheduleAmount(schedule({ amount: -520000, direction: "IN" }))).toBe(520000);
  });

  it("방향 문자열의 대소문자를 가리지 않는다", () => {
    expect(scheduleDirection(schedule({ direction: "in" }))).toBe("in");
    expect(scheduleDirection(schedule({ direction: "IN" }))).toBe("in");
  });

  it("알 수 없는 방향은 지출로 본다 — 수입으로 오해하면 예측이 낙관적으로 틀린다", () => {
    expect(scheduleDirection(schedule({ direction: "UNKNOWN" }))).toBe("out");
  });
});

describe("scheduleDateInMonth", () => {
  it("이번 달의 해당 일자를 만든다", () => {
    const d = scheduleDateInMonth(16, new Date(2026, 7, 1));
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(16);
  });

  it("그 달에 없는 날짜는 말일로 당긴다 — 다음 달로 넘어가면 순서가 뒤집힌다", () => {
    // 2026년 2월은 28일까지다. 31일 일정을 그대로 new Date 에 넘기면 3월 3일이 된다.
    const d = scheduleDateInMonth(31, new Date(2026, 1, 10));
    expect(d.getMonth()).toBe(1);
    expect(d.getDate()).toBe(28);
  });

  it("범위를 벗어난 값도 그 달 안으로 넣는다", () => {
    expect(scheduleDateInMonth(0, new Date(2026, 7, 1)).getDate()).toBe(1);
    expect(scheduleDateInMonth(99, new Date(2026, 7, 1)).getDate()).toBe(31);
  });
});

describe("toAssetFlowPoints", () => {
  it("예측 시계열을 차트 좌표로 바꾼다", () => {
    const points = toAssetFlowPoints([
      { date: "2026-08-01", balance: 1850000 },
      { date: "2026-08-25", balance: -168000 },
    ]);

    expect(points).toEqual([
      { balance: 1850000, date: "2026-08-01", day: 1, label: "1일" },
      { balance: -168000, date: "2026-08-25", day: 25, label: "25일" },
    ]);
  });

  it("음수 잔액을 그대로 유지한다 — 차트가 알려야 할 바로 그 값이다", () => {
    const [point] = toAssetFlowPoints([{ date: "2026-08-25", balance: -168000 }]);
    expect(point.balance).toBeLessThan(0);
  });

  it("null·빈 배열에서 깨지지 않는다", () => {
    expect(toAssetFlowPoints(null)).toEqual([]);
    expect(toAssetFlowPoints(undefined)).toEqual([]);
    expect(toAssetFlowPoints([])).toEqual([]);
  });
});
