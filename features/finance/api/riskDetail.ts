import type { CashflowForecast } from "@/features/home/api/homeOverview";
import { fetchApiData, fetchApiList } from "@/shared/api/apiResponse";

/** `GET /api/v1/cashflow-management/risk-causes` — 백엔드 `RiskCauseResponse`. */
export type RiskCause = Readonly<{
  causeType: string;
  label: string;
  impactAmount: number;
  reason?: string | null;
}>;

export type RiskDetailData = Readonly<{
  causes: readonly RiskCause[];
  forecast: CashflowForecast | null;
}>;

export async function fetchRiskDetail(): Promise<RiskDetailData> {
  const [forecast, causes] = await Promise.all([
    fetchApiData<CashflowForecast>("/api/v1/cashflow/forecast").catch(
      () => null,
    ),
    fetchApiList<RiskCause>("/api/v1/cashflow-management/risk-causes").catch(
      () => [] as readonly RiskCause[],
    ),
  ]);

  return { causes, forecast };
}

export type WeightedRiskCause = RiskCause &
  Readonly<{
    /** 전체 영향액 대비 비율(0~1). 막대 너비의 근거다. */
    share: number;
  }>;

/**
 * 원인별 비중을 계산한다.
 *
 * <p>예전에는 막대 너비가 25% 로 고정돼 있어, 영향이 10배 차이 나는 항목도 같은 폭으로
 * 그려졌다. 비율 막대가 비율을 나타내지 않으면 없느니만 못하다.
 *
 * <p>영향이 큰 순서로 정렬한다. 사용자가 먼저 손대야 할 것이 위에 와야 한다.
 */
export function weightRiskCauses(
  causes: readonly RiskCause[],
): readonly WeightedRiskCause[] {
  const total = causes.reduce(
    (sum, cause) => sum + Math.abs(cause.impactAmount),
    0,
  );

  if (total === 0) {
    return causes.map((cause) => ({ ...cause, share: 0 }));
  }

  return [...causes]
    .sort((a, b) => Math.abs(b.impactAmount) - Math.abs(a.impactAmount))
    .map((cause) => ({
      ...cause,
      share: Math.abs(cause.impactAmount) / total,
    }));
}
