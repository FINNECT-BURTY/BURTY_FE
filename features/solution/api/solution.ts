import type { RiskCause } from "@/features/finance/api/riskDetail";
import { fetchApiData, fetchApiList } from "@/shared/api/apiResponse";

/** `GET /api/v1/cashflow/action` — 백엔드 `ActionRecommendationResponse`. */
export type ActionRecommendation = Readonly<{
  actionType: string;
  title: string;
  description?: string | null;
  estimatedImprovement: number;
  priorityScore: number;
  /**
   * 자문 경계 문구.
   *
   * <p>금융 서비스는 어디까지가 정보 제공이고 어디부터가 투자 자문인지 밝혀야 한다.
   * 서버가 주는 이 문구를 화면에서 임의로 다듬거나 숨기지 않는다.
   */
  advisoryBoundary?: string | null;
}>;

/** `POST /api/v1/cashflow/action/execute` — 백엔드 `ActionExecutionResponse`. */
export type ActionExecution = Readonly<{
  userId?: string;
  actionType: string;
  executed: boolean;
  message?: string | null;
}>;

export type SolutionData = Readonly<{
  action: ActionRecommendation | null;
  causes: readonly RiskCause[];
}>;

export async function fetchSolution(): Promise<SolutionData> {
  const [action, causes] = await Promise.all([
    fetchApiData<ActionRecommendation>("/api/v1/cashflow/action").catch(
      () => null,
    ),
    fetchApiList<RiskCause>("/api/v1/cashflow-management/risk-causes").catch(
      () => [] as readonly RiskCause[],
    ),
  ]);

  return { action, causes };
}

/**
 * 추천 액션을 실행한다.
 *
 * <p>실패를 삼키지 않는다. 돈과 관련된 조작은 결과를 반드시 사용자에게 알려야 한다.
 */
export async function executeAction(
  actionType: string,
): Promise<ActionExecution | null> {
  return fetchApiData<ActionExecution>("/api/v1/cashflow/action/execute", {
    body: JSON.stringify({ actionType }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

export type ActionFeedback = "ACCEPT" | "REJECT";

/**
 * 추천에 대한 수용/거절 피드백.
 *
 * <p>실패해도 화면 흐름을 막지 않는다. 피드백은 추천 품질 개선용이지 사용자가
 * 다음 단계로 가는 조건이 아니다.
 */
export async function sendActionFeedback(
  actionType: string,
  feedback: ActionFeedback,
): Promise<void> {
  await fetchApiData<unknown>("/api/v1/cashflow/action/feedback", {
    body: JSON.stringify({ actionType, feedback }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  }).catch(() => null);
}
