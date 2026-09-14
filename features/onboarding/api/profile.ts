import type { AgreementState } from "@/features/onboarding/constants/agreements";

export type { AgreementState };

export type ProfileRequestBody = Readonly<{
  phone: string;
  name: string;
  birthDate: string;
  ageRange?: number;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  creditCollectionAccepted: boolean;
  creditTransferAccepted: boolean;
  marketingAccepted: boolean;
  benefitAccepted: boolean;
}>;

/**
 * 가입 완료 요청 본문.
 *
 * <p>예전에는 화면이 여섯 항목에 동의를 받고 백엔드로는 `termsAccepted: true` 하나만 보냈다.
 * 그래서 수집·이용, 전송요구, 마케팅, 혜택 동의는 기록이 남지 않았다. 동의는 무엇에 언제
 * 받았는지 증명할 수 있어야 하므로 항목별로 그대로 보낸다.
 *
 * <p>uxMode 는 보내지 않는다. 백엔드가 빈 값을 STANDARD 로 처리하므로 동작은 같고,
 * 사용자가 고른 적 없는 값을 정해서 보냈다는 인상만 사라진다 (#134).
 */
export function profileRequestBody(
  input: Readonly<{
    phone: string;
    name: string;
    birthDate: string;
    /** 생년월일에서 계산한 연령대. 계산할 수 없으면 보내지 않는다. */
    ageRange?: number;
    agreements: AgreementState;
  }>,
): ProfileRequestBody {
  return {
    ageRange: input.ageRange,
    benefitAccepted: input.agreements.benefit,
    birthDate: input.birthDate,
    creditCollectionAccepted: input.agreements.creditCollection,
    creditTransferAccepted: input.agreements.creditTransfer,
    marketingAccepted: input.agreements.marketing,
    name: input.name,
    phone: input.phone,
    privacyAccepted: input.agreements.privacy,
    termsAccepted: input.agreements.service,
  };
}
