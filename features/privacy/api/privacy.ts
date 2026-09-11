import { fetchApiData } from "@/shared/api/apiResponse";

// LEVEL_2 증명은 연동 해제도 쓴다. 보안 모듈 한 곳에 두고 여기서는 다시 내보낸다.
export { requestLevel2Proof } from "@/features/security/api/riskProof";

/** `DELETE /api/v1/privacy/me` — 백엔드 `WithdrawResponse`. */
export type WithdrawResult = Readonly<{
  status?: string | null;
  retentionUntil?: string | null;
  note?: string | null;
}>;

/** 열람 응답. 백엔드가 `Map<String, Object>` 로 주므로 모양이 고정돼 있지 않다. */
export type PersonalDataExport = Readonly<Record<string, unknown>>;

/**
 * 정정할 수 있는 항목.
 *
 * <p>백엔드는 `name` 만 받는다. 전화번호·생년월일 같은 본인확인 기반 항목은 별도 절차가
 * 필요해 여기서 다루지 않는다. 목록을 늘리기 전에 백엔드부터 확인해야 한다.
 */
export const RECTIFIABLE_FIELDS = [{ field: "name", label: "이름" }] as const;

export function exportPersonalData(
  riskProof: string,
): Promise<PersonalDataExport | null> {
  return fetchApiData<PersonalDataExport>("/api/v1/privacy/me/export", {
    headers: { "X-Risk-Proof": riskProof },
  });
}

export function rectifyPersonalData(
  riskProof: string,
  field: string,
  value: string,
): Promise<unknown> {
  return fetchApiData("/api/v1/privacy/me", {
    body: JSON.stringify({ field, value }),
    headers: { "Content-Type": "application/json", "X-Risk-Proof": riskProof },
    method: "PATCH",
  });
}

export function withdrawAccount(
  riskProof: string,
  reason: string,
): Promise<WithdrawResult | null> {
  return fetchApiData<WithdrawResult>("/api/v1/privacy/me", {
    body: JSON.stringify({ reason }),
    headers: { "Content-Type": "application/json", "X-Risk-Proof": riskProof },
    method: "DELETE",
  });
}

/** 열람 결과에서 사람이 읽을 수 있게 이름 붙인 구획. */
export type ExportSection = Readonly<{
  key: string;
  label: string;
  value: unknown;
}>;

const sectionLabels: Readonly<Record<string, string>> = {
  account: "계정",
  consentHistory: "동의 이력",
  devices: "등록 기기",
  erasure: "파기 요청",
  financialRecordCounts: "금융 기록 건수",
  linkedInstitutions: "연결된 기관",
  profile: "프로필",
  socialAccounts: "소셜 계정",
};

/**
 * 열람 응답을 화면에 올릴 구획으로 정리한다.
 *
 * <p>이름을 붙이지 못한 키는 빼지 않고 키 그대로 남긴다. 열람권은 보유한 정보를 빠짐없이
 * 보여주는 것이 목적이라, 모르는 항목을 숨기면 권리 행사가 불완전해진다. 라벨을 못 붙인
 * 것은 화면의 문제이지 감출 이유가 아니다.
 */
export function toExportSections(
  data: PersonalDataExport | null,
): readonly ExportSection[] {
  if (!data) return [];

  return Object.entries(data)
    .filter(([, value]) => !isEmptyValue(value))
    .map(([key, value]) => ({
      key,
      label: sectionLabels[key] ?? key,
      value,
    }));
}

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}
