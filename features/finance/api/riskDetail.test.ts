import { describe, expect, it } from "vitest";

import { weightRiskCauses } from "@/features/finance/api/riskDetail";

/**
 * 원인 비중 계산.
 *
 * <p>예전에는 막대 너비가 25% 고정이라 영향이 7배 차이 나는 항목도 같은 폭으로 그려졌다.
 * 비율 막대가 비율을 나타내지 않으면 없느니만 못하다.
 */
describe("weightRiskCauses", () => {
  const causes = [
    { causeType: "SUBSCRIPTION", label: "구독료", impactAmount: 100 },
    { causeType: "CARD_BILL", label: "카드값", impactAmount: 700 },
    { causeType: "RENT", label: "월세", impactAmount: 200 },
  ];

  it("영향액에 비례해 비중을 계산한다", () => {
    const weighted = weightRiskCauses(causes);
    const byType = Object.fromEntries(weighted.map((c) => [c.causeType, c.share]));

    expect(byType.CARD_BILL).toBeCloseTo(0.7);
    expect(byType.RENT).toBeCloseTo(0.2);
    expect(byType.SUBSCRIPTION).toBeCloseTo(0.1);
  });

  it("비중의 합은 1 이다", () => {
    const total = weightRiskCauses(causes).reduce((sum, c) => sum + c.share, 0);
    expect(total).toBeCloseTo(1);
  });

  it("영향이 큰 순서로 정렬한다 — 먼저 손댈 것이 위에 와야 한다", () => {
    expect(weightRiskCauses(causes).map((c) => c.causeType)).toEqual([
      "CARD_BILL",
      "RENT",
      "SUBSCRIPTION",
    ]);
  });

  it("부호와 무관하게 크기로 비교한다 — 백엔드는 지출을 양수로 보낸다", () => {
    const mixed = [
      { causeType: "A", label: "A", impactAmount: -700 },
      { causeType: "B", label: "B", impactAmount: 300 },
    ];
    expect(weightRiskCauses(mixed).map((c) => c.causeType)).toEqual(["A", "B"]);
  });

  it("합이 0 이면 0 으로 나누지 않는다", () => {
    const zero = [{ causeType: "A", label: "A", impactAmount: 0 }];
    expect(weightRiskCauses(zero)[0].share).toBe(0);
  });

  it("빈 목록에서 깨지지 않는다", () => {
    expect(weightRiskCauses([])).toEqual([]);
  });
});
