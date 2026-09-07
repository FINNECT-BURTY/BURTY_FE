import { describe, expect, it } from "vitest";

import {
  budgetLabel,
  type BudgetStatus,
  budgetTone,
  isTotalBudget,
  sortBudgets,
} from "@/features/budget/api/budgets";

function status(overrides: Partial<BudgetStatus> = {}): BudgetStatus {
  return {
    budgetAmount: 500_000,
    budgetId: 1,
    categoryCode: "FOOD",
    exceeded: false,
    remainingAmount: 200_000,
    spentAmount: 300_000,
    usagePercent: 60,
    ...overrides,
  };
}

describe("isTotalBudget", () => {
  it("categoryCode 가 없으면 전체 예산이다", () => {
    expect(isTotalBudget(status({ categoryCode: null }))).toBe(true);
  });

  it("빈 문자열도 전체 예산으로 본다", () => {
    // 백엔드가 공백을 null 로 정규화하지만, 화면이 그 정규화에 기대지 않게 한다.
    expect(isTotalBudget(status({ categoryCode: "" }))).toBe(true);
  });

  it("카테고리가 있으면 전체 예산이 아니다", () => {
    expect(isTotalBudget(status({ categoryCode: "FOOD" }))).toBe(false);
  });
});

describe("budgetLabel", () => {
  it("전체 예산은 전체 예산으로 읽는다", () => {
    expect(budgetLabel(status({ categoryCode: null }))).toBe("전체 예산");
  });

  it("아는 카테고리는 한글로 읽는다", () => {
    expect(budgetLabel(status({ categoryCode: "FOOD" }))).toBe("식비");
  });

  it("모르는 코드를 화면에 그대로 내보내지 않는다", () => {
    // 내부 코드가 새어나가면 안 된다. 사용자에게는 의미 없는 문자열이다.
    expect(budgetLabel(status({ categoryCode: "WEIRD_CODE" }))).toBe("기타");
  });
});

describe("sortBudgets", () => {
  it("전체 예산이 항상 맨 앞이다", () => {
    const sorted = sortBudgets([
      status({ budgetId: 1, categoryCode: "FOOD", usagePercent: 95 }),
      status({ budgetId: 2, categoryCode: null, usagePercent: 10 }),
    ]);
    expect(sorted[0]?.budgetId).toBe(2);
  });

  it("나머지는 사용률이 높은 순이다", () => {
    // 먼저 봐야 하는 것은 넉넉한 항목이 아니라 위험한 항목이다.
    const sorted = sortBudgets([
      status({ budgetId: 1, categoryCode: "FOOD", usagePercent: 30 }),
      status({ budgetId: 2, categoryCode: "CAFE", usagePercent: 90 }),
      status({ budgetId: 3, categoryCode: "SHOPPING", usagePercent: 60 }),
    ]);
    expect(sorted.map((item) => item.budgetId)).toEqual([2, 3, 1]);
  });

  it("입력 배열을 바꾸지 않는다", () => {
    // 조회 결과를 그대로 정렬하면 다른 화면이 보고 있는 순서가 함께 바뀐다.
    const input = [
      status({ budgetId: 1, usagePercent: 10 }),
      status({ budgetId: 2, usagePercent: 90 }),
    ];
    sortBudgets(input);
    expect(input.map((item) => item.budgetId)).toEqual([1, 2]);
  });
});

describe("budgetTone", () => {
  it("초과는 서버 판정을 그대로 따른다", () => {
    // 사용률이 낮아 보여도 서버가 초과라고 하면 초과다. 화면이 금액으로
    // 다시 계산하면 반올림 차이로 경고와 색이 어긋난다.
    expect(budgetTone(status({ exceeded: true, usagePercent: 12 }))).toBe(
      "danger",
    );
  });

  it("80% 부터 경고다", () => {
    expect(budgetTone(status({ usagePercent: 79 }))).toBe("normal");
    expect(budgetTone(status({ usagePercent: 80 }))).toBe("warning");
  });
});
