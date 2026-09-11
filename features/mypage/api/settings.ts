import type { CashflowSchedule } from "@/features/finance/api/assetFlow";
import { requestLevel2Proof } from "@/features/security/api/riskProof";
import { stepUpWithBiometrics } from "@/features/security/api/stepUp";
import { fetchApiData, fetchApiList } from "@/shared/api/apiResponse";

/** `GET /api/v1/mydata/institutions` — 백엔드 `InstitutionResponse`. */
export type LinkedInstitution = Readonly<{
  institutionCode: string;
  /** LINKED | UNLINKED | ERROR 등 */
  status?: string | null;
  linkedAt?: string | null;
  tokenExpiresAt?: string | null;
  unlinkedAt?: string | null;
  lastErrorCode?: string | null;
  lastErrorAt?: string | null;
}>;

/** `GET /api/v1/devices` — 백엔드 `DeviceResponse`. */
export type UserDevice = Readonly<{
  deviceId: string;
  deviceName?: string | null;
  platform?: string | null;
  osVersion?: string | null;
  appVersion?: string | null;
  trusted: boolean;
  lastSeenAt?: string | null;
  createdAt?: string | null;
}>;

/** `GET /api/v1/sessions` — 백엔드 `SessionResponse`. */
export type UserSession = Readonly<{
  sessionId: string;
  userId?: string | null;
  deviceId?: string | null;
  createdAt?: string | null;
  expiresAt?: string | null;
}>;

// ── 금융 연동 ──────────────────────────────────────────────────────────────

export function fetchLinkedInstitutions(): Promise<
  readonly LinkedInstitution[]
> {
  return fetchApiList<LinkedInstitution>("/api/v1/mydata/institutions");
}

/**
 * 연동 해제. 백엔드가 LEVEL_2 단계 인증을 요구한다.
 *
 * <p>예전에는 증명 없이 보내 403 으로 막혔고, 화면에는 "연동 해제에 실패했어요" 만 떴다.
 * 해제는 정보주체가 수집을 멈추는 수단이라 막히면 안 된다.
 */
export async function unlinkInstitution(institutionCode: string): Promise<unknown> {
  const riskProof = await requestLevel2Proof();
  return fetchApiData<unknown>(
    `/api/v1/mydata/institutions/${encodeURIComponent(institutionCode)}`,
    { headers: { "X-Risk-Proof": riskProof }, method: "DELETE" },
  );
}

/**
 * 기관 코드를 표시명으로.
 *
 * <p>서버는 코드만 준다. 모르는 코드는 코드 그대로 보여준다 — 임의로 "기타" 로 뭉치면
 * 사용자가 어떤 기관을 끊는지 알 수 없다.
 */
const institutionNames: Readonly<Record<string, string>> = {
  HANA: "하나은행",
  IM: "iM뱅크",
  KAKAO: "카카오뱅크",
  KB: "KB국민은행",
  NH: "NH농협은행",
  SHINHAN: "신한은행",
  TOSS: "토스뱅크",
  WOORI: "우리은행",
};

export function institutionName(code: string): string {
  return institutionNames[code.toUpperCase()] ?? code;
}

export function isInstitutionLinked(
  institution: LinkedInstitution,
): boolean {
  if (institution.unlinkedAt) return false;
  const status = institution.status?.toUpperCase();
  return status !== "UNLINKED" && status !== "REVOKED";
}

// ── 고정 지출 일정 ─────────────────────────────────────────────────────────

export function fetchSchedules(): Promise<readonly CashflowSchedule[]> {
  return fetchApiList<CashflowSchedule>("/api/v1/cashflow-management/schedules");
}

export function deactivateSchedule(scheduleId: string): Promise<unknown> {
  return fetchApiData<unknown>(
    `/api/v1/cashflow-management/schedules/${encodeURIComponent(scheduleId)}`,
    { method: "DELETE" },
  );
}

// ── 보안: 기기와 세션 ──────────────────────────────────────────────────────

export type SecurityData = Readonly<{
  devices: readonly UserDevice[];
  sessions: readonly UserSession[];
}>;

export async function fetchSecurity(): Promise<SecurityData> {
  const [devices, sessions] = await Promise.all([
    fetchApiList<UserDevice>("/api/v1/devices").catch(
      () => [] as readonly UserDevice[],
    ),
    fetchSessions().catch(() => [] as readonly UserSession[]),
  ]);

  return { devices, sessions };
}

/**
 * 로그인 세션 목록. 백엔드가 LEVEL_2 단계 인증을 요구한다.
 *
 * <p>예전에는 증명 없이 불러 403 을 받았고, 실패를 빈 목록으로 삼켜 세션이 항상 0개로 보였다.
 */
async function fetchSessions(): Promise<readonly UserSession[]> {
  const riskProof = await requestLevel2Proof();
  return fetchApiList<UserSession>("/api/v1/sessions", {
    headers: { "X-Risk-Proof": riskProof },
  });
}

/** 세션 하나를 끊는다. 백엔드가 LEVEL_2 단계 인증을 요구한다. */
export async function revokeSession(sessionId: string): Promise<unknown> {
  const riskProof = await requestLevel2Proof();
  return fetchApiData<unknown>(
    `/api/v1/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { "X-Risk-Proof": riskProof }, method: "DELETE" },
  );
}

/**
 * 현재 기기를 포함한 모든 세션을 끊는다. 기기를 잃어버렸을 때 쓰는 기능이다.
 *
 * <p>되돌릴 수 없는 동작이라 백엔드가 LEVEL_3 를 요구한다. 생체 단계 인증으로 증명을 받는다.
 * 예전에는 증명 없이 보내 항상 403 으로 막혔다.
 */
export async function revokeAllSessions(userId: string): Promise<unknown> {
  const { riskProof } = await stepUpWithBiometrics(userId);
  return fetchApiData<unknown>("/api/v1/sessions", {
    headers: { "X-Risk-Proof": riskProof },
    method: "DELETE",
  });
}
