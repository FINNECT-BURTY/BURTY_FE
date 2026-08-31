import { describe, expect, it } from "vitest";

import {
  categoryLabel,
  groupByDate,
  isCategoryTrusted,
  signedAmount,
  transactionDirection,
  type TransactionItem,
  transactionTitle,
} from "@/features/transaction/api/transactions";

function item(overrides: Partial<TransactionItem> = {}): TransactionItem {
  return {
    amount: 1000,
    direction: "OUT",
    txId: "t1",
    txnDate: "2026-08-25",
    ...overrides,
  };
}

describe("signedAmount", () => {
  /**
   * 백엔드는 크기와 방향을 따로 준다. 방향을 무시하면 지출이 수입으로 보인다 —
   * 잔액을 잘못 읽게 만드는 종류의 실수다.
   */
  it("출금은 음수, 입금은 양수로 만든다", () => {
    expect(signedAmount(item({ amount: 3000, direction: "OUT" }))).toBe(-3000);
    expect(signedAmount(item({ amount: 3000, direction: "IN" }))).toBe(3000);
  });

  it("이미 음수로 온 금액도 방향을 따른다", () => {
    expect(signedAmount(item({ amount: -3000, direction: "IN" }))).toBe(3000);
  });

  it("방향을 소문자로 줘도 입금으로 읽는다", () => {
    expect(transactionDirection(item({ direction: "in" }))).toBe("in");
  });

  it("모르는 방향은 출금으로 본다", () => {
    // 수입으로 잘못 세면 쓸 수 있는 돈을 실제보다 많게 보여준다. 보수적으로 읽는다.
    expect(transactionDirection(item({ direction: "?" }))).toBe("out");
  });
});

describe("transactionTitle", () => {
  it("가맹점을 우선 쓴다", () => {
    expect(transactionTitle(item({ memo: "메모", merchant: "스타벅스" }))).toBe(
      "스타벅스",
    );
  });

  it("가맹점이 비어 있으면 메모를 쓴다", () => {
    expect(transactionTitle(item({ memo: "관리비", merchant: "  " }))).toBe(
      "관리비",
    );
  });

  it("둘 다 없으면 빈 칸 대신 방향을 알린다", () => {
    expect(transactionTitle(item({ direction: "IN" }))).toBe("입금");
    expect(transactionTitle(item({ direction: "OUT" }))).toBe("출금");
  });
});

describe("categoryLabel", () => {
  it("코드를 한글로 바꾼다", () => {
    expect(categoryLabel(item({ expenseCategoryCode: "CAFE" }))).toBe("카페");
  });

  it("모르는 코드는 내부 코드 대신 아무것도 보여주지 않는다", () => {
    expect(categoryLabel(item({ expenseCategoryCode: "WEIRD_CODE" }))).toBe("");
  });

  /**
   * 낮은 신뢰도를 확정된 것처럼 보여주면 사용자가 잘못된 분류를 근거로 지출을 판단한다.
   */
  it("신뢰도가 낮으면 분류를 표시하지 않는다", () => {
    const low = item({ categoryConfidence: 0.3, expenseCategoryCode: "CAFE" });
    expect(isCategoryTrusted(low)).toBe(false);
    expect(categoryLabel(low)).toBe("");
  });

  it("신뢰도를 주지 않는 출처는 그대로 믿는다", () => {
    expect(isCategoryTrusted(item({ categoryConfidence: null }))).toBe(true);
  });
});

describe("groupByDate", () => {
  const items = [
    item({ amount: 1000, direction: "OUT", txId: "a", txnDate: "2026-08-25" }),
    item({ amount: 5000, direction: "IN", txId: "b", txnDate: "2026-08-26" }),
    item({ amount: 2000, direction: "OUT", txId: "c", txnDate: "2026-08-25" }),
  ];

  it("최신 날짜가 먼저 오게 묶는다", () => {
    expect(groupByDate(items).map((g) => g.date)).toEqual([
      "2026-08-26",
      "2026-08-25",
    ]);
  });

  it("하루 합계는 방향을 반영한다", () => {
    const groups = groupByDate(items);
    expect(groups[0].total).toBe(5000);
    expect(groups[1].total).toBe(-3000);
  });

  it("같은 날 거래를 한 묶음에 넣는다", () => {
    expect(groupByDate(items)[1].items).toHaveLength(2);
  });

  it("빈 목록은 빈 결과를 준다", () => {
    expect(groupByDate([])).toEqual([]);
  });
});
