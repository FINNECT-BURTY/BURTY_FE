import { fetchApiData } from "@/shared/api/apiResponse";

/** `POST /api/v1/security/level2/proof` — 백엔드 `RiskProofResponse`. */
type RiskProofResponse = Readonly<{ riskProof?: string | null }>;

/**
 * 생체인증 없이 받는 LEVEL_2 증명. `X-Risk-Proof` 헤더로 보낸다.
 *
 * <p>개인정보 열람·정정, 금융기관 연동 해제처럼 LEVEL_2 가 필요한 요청 앞에서 부른다.
 * LEVEL_3(이체·탈퇴)은 생체인증({@link stepUpWithBiometrics})을 거친다.
 */
export async function requestLevel2Proof(): Promise<string> {
  const result = await fetchApiData<RiskProofResponse>(
    "/api/v1/security/level2/proof",
    { method: "POST" },
  );

  if (!result?.riskProof) {
    throw new Error("본인확인에 실패했습니다");
  }

  return result.riskProof;
}
