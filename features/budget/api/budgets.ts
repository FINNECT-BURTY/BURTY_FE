import { categoryCodeLabel } from "@/features/transaction";
import { fetchApiData, fetchApiList } from "@/shared/api/apiResponse";

/**
 * `GET /api/v1/budgets` — 백엔드 `BudgetService.BudgetStatus`.
 *
 * <p>`categoryCode` 가 없으면 카테고리를 가리지 않는 전체 예산이다. 백엔드가
 * 빈 문자열을 `null` 로 정규화하므로 화면도 둘을 같게 다룬다.
 */
export type BudgetStatus = Readonly<{
  budgetId: number;
  categoryCode?: string | null;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercent: number;
  exceeded: boolean;
}>;

/** `PUT /api/v1/budgets` 요청 본문. */
export type BudgetUpsert = Readonly<{
  /** 비우면 전체 예산이다. */
  categoryCode?: string | null;
  amount: number;
  alertThresholdPercent?: number;
}>;

const BUDGETS = "/api/v1/budgets";

export function fetchBudgets(): Promise<readonly BudgetStatus[]> {
  return fetchApiList<BudgetStatus>(BUDGETS);
}

export function upsertBudget(input: BudgetUpsert): Promise<unknown> {
  return fetchApiData(BUDGETS, {
    body: JSON.stringify({
      alertThresholdPercent: input.alertThresholdPercent,
      // 빈 문자열을 보내면 전체 예산이 아니라 이름이 빈 카테고리로 읽힐 수 있다.
      categoryCode: input.categoryCode ? input.categoryCode : null,
      amount: input.amount,
    }),
    headers: { "Content-Type": "application/json" },
    method: "PUT",
  });
}

export function deactivateBudget(budgetId: number): Promise<unknown> {
  return fetchApiData(`${BUDGETS}/${budgetId}`, { method: "DELETE" });
}

/** 예산 초과를 다시 계산한다. 초과로 새로 판정된 건수를 돌려준다. */
export function evaluateBudgets(): Promise<number | null> {
  return fetchApiData<number>(`${BUDGETS}/evaluate`, { method: "POST" });
}

/** 전체 예산인지. */
export function isTotalBudget(status: BudgetStatus): boolean {
  return !status.categoryCode;
}

/** 화면에 쓸 이름. 모르는 카테고리 코드는 그대로 노출하지 않는다. */
export function budgetLabel(status: BudgetStatus): string {
  if (isTotalBudget(status)) return "전체 예산";
  return categoryCodeLabel(status.categoryCode) || "기타";
}

/**
 * 전체 예산을 맨 앞에, 나머지는 사용률이 높은 순으로.
 *
 * <p>예산 화면에서 먼저 봐야 하는 것은 넉넉한 항목이 아니라 위험한 항목이다.
 * 서버 정렬을 신뢰하지 않는다.
 */
export function sortBudgets(
  items: readonly BudgetStatus[],
): readonly BudgetStatus[] {
  return [...items].sort((a, b) => {
    if (isTotalBudget(a) !== isTotalBudget(b)) return isTotalBudget(a) ? -1 : 1;
    return b.usagePercent - a.usagePercent;
  });
}

export type BudgetTone = "danger" | "normal" | "warning";

/**
 * 사용률을 색 단계로.
 *
 * <p>`exceeded` 는 서버 판정을 그대로 따른다. 화면이 금액으로 다시 계산하면
 * 반올림 차이로 서버가 보낸 경고와 화면 색이 어긋날 수 있다.
 */
export function budgetTone(status: BudgetStatus): BudgetTone {
  if (status.exceeded) return "danger";
  return status.usagePercent >= 80 ? "warning" : "normal";
}
