import { fetchApiData } from "@/shared/api/apiResponse";

/** `GET /api/v1/assets/summary` — 백엔드 `AssetSummaryResponse`. */
export type AssetSummary = Readonly<{
  userId?: string;
  totalAsset: number;
  monthlySpend: number;
  volatilityPercent: number;
  /** 0 이면 금액은 "0원" 이 아니라 "모름" 이다. 옛 백엔드는 이 값을 주지 않는다. */
  linkedInstitutionCount?: number;
  /** 조회에 실패해 합계에서 빠진 기관 수. */
  failedInstitutionCount?: number;
}>;

/** `GET /api/v1/cashflow/risk` — 백엔드 `RiskAssessmentResponse`. */
export type RiskAssessment = Readonly<{
  userId?: string;
  /** GREEN | YELLOW | RED */
  level: string;
  threshold: number;
  reason?: string | null;
  /** 위험이 예상되는 날. 위험이 없으면 null 이다. */
  riskDate?: string | null;
  projectedBalance: number;
}>;

/** `GET /api/v1/cashflow/forecast` — 백엔드 `CashflowForecastResponse`. */
export type CashflowForecast = Readonly<{
  userId?: string;
  generatedDate?: string;
  openingBalance: number;
  minimumBalance: number;
  riskDate?: string | null;
  riskReason?: string | null;
  dailyBalances?: readonly DailyBalancePoint[] | null;
  safetyBalance: number;
  dataSource?: string;
  customCriteriaUsed?: boolean;
}>;

export type DailyBalancePoint = Readonly<{
  date: string;
  balance: number;
}>;

/**
 * 홈 화면이 필요로 하는 것 전부.
 *
 * <p>세 요청을 함께 보낸다. 순차로 보내면 가장 느린 응답이 앞선 응답을 기다리게 만들어
 * 첫 화면이 눈에 띄게 늦어진다.
 *
 * <p>일부만 실패해도 나머지는 보여준다. 자산 요약이 실패했다고 위험 경고까지 숨기면
 * 정작 사용자가 알아야 할 것을 못 보게 된다.
 */
export type HomeOverview = Readonly<{
  assets: AssetSummary | null;
  forecast: CashflowForecast | null;
  risk: RiskAssessment | null;
}>;

export async function fetchHomeOverview(): Promise<HomeOverview> {
  const [assets, forecast, risk] = await Promise.all([
    fetchApiData<AssetSummary>("/api/v1/assets/summary").catch(() => null),
    fetchApiData<CashflowForecast>("/api/v1/cashflow/forecast").catch(
      () => null,
    ),
    fetchApiData<RiskAssessment>("/api/v1/cashflow/risk").catch(() => null),
  ]);

  return { assets, forecast, risk };
}

/**
 * 이번 달 남은 예산 대비 오늘 쓸 수 있는 금액.
 *
 * <p>백엔드가 "오늘 소비 가능 금액" 을 직접 주지 않으므로 예측에서 유도한다.
 * 근거를 화면에 함께 적어야 사용자가 이 숫자를 믿을 수 있다.
 *
 * <p>남은 날로 나눈다. 남은 잔액을 그대로 보여주면 월말까지 쓸 돈을 오늘 다 쓸 수 있는
 * 것처럼 읽힌다.
 */
export function deriveDailySpendable(
  forecast: CashflowForecast | null,
): Readonly<{ perDay: number; remainingDays: number; usable: number }> | null {
  if (!forecast) return null;

  const usable = forecast.openingBalance - forecast.safetyBalance;
  const points = forecast.dailyBalances ?? [];
  const remainingDays = Math.max(points.length, 1);

  return {
    perDay: Math.max(Math.floor(usable / remainingDays), 0),
    remainingDays,
    usable: Math.max(usable, 0),
  };
}

export type AssetState =
  | Readonly<{ kind: "unknown" }>
  | Readonly<{ kind: "unlinked" }>
  | Readonly<{ kind: "linked"; partial: boolean }>;

/**
 * 자산 요약을 화면 상태로.
 *
 * <p>연결하지 않은 사용자의 총자산은 0 이지만 "0원" 이 아니라 "모름" 이다. 0원이라고 보여주면
 * 자산이 없다고 읽힌다. 예전에는 연결하지 않아도 모든 사용자에게 같은 고정값이 보였다.
 *
 * <p>연동 수를 주지 않는 옛 백엔드는 연결된 것으로 본다 — 그때까지의 동작을 바꾸지 않는다.
 */
export function describeAssetState(assets: AssetSummary | null): AssetState {
  if (!assets) return { kind: "unknown" };
  if (assets.linkedInstitutionCount === 0) return { kind: "unlinked" };
  return { kind: "linked", partial: (assets.failedInstitutionCount ?? 0) > 0 };
}
