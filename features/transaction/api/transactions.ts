import { fetchApiData } from "@/shared/api/apiResponse";

/** `GET /api/v1/transactions` 의 한 건 — 백엔드 `TransactionResponse`. */
export type TransactionItem = Readonly<{
  txId: string;
  txnDate: string;
  /** 부호 없는 크기. 방향은 `direction` 에 따로 있다. */
  amount: number;
  /** IN | OUT */
  direction: string;
  merchant?: string | null;
  memo?: string | null;
  expenseCategoryCode?: string | null;
  incomeCategoryCode?: string | null;
  source?: string | null;
  /** 자동 분류 신뢰도(0~1). 낮으면 사용자에게 확인을 구해야 한다. */
  categoryConfidence?: number | null;
}>;

/** 백엔드 `PageResponse<T>`. */
export type TransactionPage = Readonly<{
  content: readonly TransactionItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}>;

const EMPTY_PAGE: TransactionPage = {
  content: [],
  hasNext: false,
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
};

export const TRANSACTION_PAGE_SIZE = 30;

export async function fetchTransactions(page: number): Promise<TransactionPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(TRANSACTION_PAGE_SIZE),
  });

  const result = await fetchApiData<TransactionPage>(
    `/api/v1/transactions?${params}`,
  );

  return result ?? EMPTY_PAGE;
}

export type TransactionDirection = "in" | "out";

export function transactionDirection(item: TransactionItem): TransactionDirection {
  return item.direction?.toUpperCase() === "IN" ? "in" : "out";
}

/** 부호 있는 금액. 백엔드는 크기만 주고 방향을 따로 준다. */
export function signedAmount(item: TransactionItem): number {
  const magnitude = Math.abs(item.amount);
  return transactionDirection(item) === "in" ? magnitude : -magnitude;
}

/**
 * 표시할 이름.
 *
 * <p>가맹점이 없으면 메모를, 둘 다 없으면 방향만 알린다. 빈 칸을 두면 어떤 거래인지
 * 짐작할 근거가 아예 없어진다.
 */
export function transactionTitle(item: TransactionItem): string {
  const merchant = item.merchant?.trim();
  if (merchant) return merchant;

  const memo = item.memo?.trim();
  if (memo) return memo;

  return transactionDirection(item) === "in" ? "입금" : "출금";
}

/**
 * 분류를 신뢰할 수 있는가.
 *
 * <p>자동 분류는 틀릴 수 있다. 낮은 신뢰도를 확정된 것처럼 보여주면 사용자가 잘못된
 * 카테고리를 근거로 지출을 판단한다. 임계 미만은 화면에서 표시하지 않는다.
 */
const CONFIDENCE_THRESHOLD = 0.6;

export function isCategoryTrusted(item: TransactionItem): boolean {
  if (item.categoryConfidence === null || item.categoryConfidence === undefined) {
    // 신뢰도를 주지 않는 출처(수기 입력 등)는 그대로 믿는다.
    return true;
  }
  return item.categoryConfidence >= CONFIDENCE_THRESHOLD;
}

/** 카테고리 코드를 한글로. 모르는 코드는 표시하지 않는다 — 내부 코드가 새어나가면 안 된다. */
const categoryLabels: Readonly<Record<string, string>> = {
  CAFE: "카페",
  CONVENIENCE: "편의점",
  CULTURE: "문화",
  EDUCATION: "교육",
  FOOD: "식비",
  GROCERY: "장보기",
  HEALTH: "의료",
  HOUSING: "주거",
  INTEREST: "이자",
  SALARY: "급여",
  SHOPPING: "쇼핑",
  SUBSCRIPTION: "구독",
  TRANSFER: "이체",
  TRANSPORT: "교통",
};

export function categoryLabel(item: TransactionItem): string {
  if (!isCategoryTrusted(item)) return "";
  const code = item.expenseCategoryCode ?? item.incomeCategoryCode;
  if (!code) return "";
  return categoryLabels[code.toUpperCase()] ?? "";
}

/** 날짜별로 묶는다. 목록이 길어지면 언제 쓴 돈인지가 먼저 필요하다. */
export type TransactionGroup = Readonly<{
  date: string;
  items: readonly TransactionItem[];
  /** 그 날의 합계. 하루 단위로 얼마나 썼는지가 목록의 주된 질문이다. */
  total: number;
}>;

export function groupByDate(
  items: readonly TransactionItem[],
): readonly TransactionGroup[] {
  const buckets = new Map<string, TransactionItem[]>();

  for (const item of items) {
    const bucket = buckets.get(item.txnDate);
    if (bucket) bucket.push(item);
    else buckets.set(item.txnDate, [item]);
  }

  return [...buckets.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, group]) => ({
      date,
      items: group,
      total: group.reduce((sum, item) => sum + signedAmount(item), 0),
    }));
}
