import { fetchApiData, fetchApiList } from "@/shared/api/apiResponse";

/** `GET /family/dashboard` — 백엔드 `FamilyDashboardResponse`. */
export type FamilyDashboard = Readonly<{
  userId?: string;
  alertCount: number;
  unusualTransactionCount: number;
  monthlyReportDeliveredCount: number;
}>;

/** `GET /family-alerts` — 백엔드 `FamilyAlertResponse`. */
export type FamilyAlert = Readonly<{
  userId?: string;
  message: string;
  sentAt: string;
}>;

/** `GET /family/consents` — 백엔드 `FamilyConsentResponse`. */
export type FamilyConsent = Readonly<{
  parentUserId: string;
  childUserId: string;
  consented: boolean;
}>;

/** `GET /family/approvals/*` — 백엔드 `TransferApprovalController.ApprovalResponse`. */
export type TransferApproval = Readonly<{
  approvalId: number;
  orderId?: number;
  requesterUserId?: string;
  amount: number;
  toAccountMasked?: string | null;
  status: string;
  requestedAt?: string | null;
  expiresAt?: string | null;
}>;

export type FamilyOverview = Readonly<{
  alerts: readonly FamilyAlert[];
  dashboard: FamilyDashboard | null;
  myRequests: readonly TransferApproval[];
  pendingApprovals: readonly TransferApproval[];
}>;

/**
 * 가족 보호 화면에 필요한 것을 한 번에 모은다.
 *
 * <p>한 조각이 실패해도 나머지는 보여준다. 알림을 못 불러왔다고 승인 대기 목록까지
 * 사라지면, 정작 지금 막아야 할 이체를 놓친다.
 */
export async function fetchFamilyOverview(): Promise<FamilyOverview> {
  const [dashboard, alerts, pendingApprovals, myRequests] = await Promise.all([
    fetchApiData<FamilyDashboard>("/api/v1/family/dashboard").catch(() => null),
    fetchApiList<FamilyAlert>("/api/v1/family-alerts").catch(
      () => [] as readonly FamilyAlert[],
    ),
    fetchApiList<TransferApproval>("/api/v1/family/approvals/pending").catch(
      () => [] as readonly TransferApproval[],
    ),
    fetchApiList<TransferApproval>("/api/v1/family/approvals/mine").catch(
      () => [] as readonly TransferApproval[],
    ),
  ]);

  return { alerts, dashboard, myRequests, pendingApprovals };
}

export function fetchFamilyConsents(
  parentUserId: string,
): Promise<readonly FamilyConsent[]> {
  const params = new URLSearchParams({ parentUserId });
  return fetchApiList<FamilyConsent>(`/api/v1/family/consents?${params}`);
}

// ── 승인 · 거절 ───────────────────────────────────────────────────────────

export type ApprovalDecision = "approve" | "reject";

/**
 * 보호자 결정을 보낸다.
 *
 * <p>승인·거절은 LEVEL_2 다. 화면에서 먼저 증명을 발급받아 `X-Risk-Proof` 로 보낸다.
 * 증명은 결정마다 새로 받는다 — 한 번 받은 증명을 재사용하면 단계 인증의 의미가 없다.
 */
export async function decideApproval(
  approvalId: number,
  decision: ApprovalDecision,
  note: string,
): Promise<TransferApproval | null> {
  const proof = await issueLevel2Proof();

  return fetchApiData<TransferApproval>(
    `/api/v1/family/approvals/${approvalId}/${decision}`,
    {
      body: JSON.stringify({ note: note.trim() || null }),
      headers: {
        "Content-Type": "application/json",
        "X-Risk-Proof": proof,
      },
      method: "POST",
    },
  );
}

async function issueLevel2Proof(): Promise<string> {
  const result = await fetchApiData<{ riskProof?: string }>(
    "/api/v1/security/level2/proof",
    { method: "POST" },
  );

  if (!result?.riskProof) {
    throw new Error("단계 인증 증명을 받지 못했습니다");
  }

  return result.riskProof;
}

// ── 표시용 도우미 ─────────────────────────────────────────────────────────

export type ApprovalState = "pending" | "approved" | "rejected" | "expired";

export function classifyApproval(status: string | null | undefined): ApprovalState {
  switch ((status ?? "").toUpperCase()) {
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "EXPIRED":
      return "expired";
    default:
      return "pending";
  }
}

const approvalLabels: Record<ApprovalState, string> = {
  approved: "승인함",
  expired: "기한 지남",
  pending: "대기 중",
  rejected: "거절함",
};

export function approvalStateLabel(state: ApprovalState): string {
  return approvalLabels[state];
}

/**
 * 승인 기한까지 남은 시간.
 *
 * <p>보류된 이체는 기한이 지나면 자동으로 사라진다. 얼마나 남았는지 보이지 않으면
 * 보호자가 늦게 열어보고 승인 기회를 놓친다.
 */
export function remainingLabel(
  expiresAt: string | null | undefined,
  now = new Date(),
): string {
  if (!expiresAt) return "";

  const deadline = new Date(expiresAt).getTime();
  if (Number.isNaN(deadline)) return "";

  const minutes = Math.floor((deadline - now.getTime()) / 60_000);
  if (minutes <= 0) return "기한이 지났어요";
  if (minutes < 60) return `${minutes}분 남음`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 남음`;

  return `${Math.floor(hours / 24)}일 남음`;
}
