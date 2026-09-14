import { describe, expect, it } from "vitest";

import { type AgreementState, profileRequestBody } from "@/features/onboarding/api/profile";
import { agreementItems } from "@/features/onboarding/constants/agreements";

function agreements(overrides: Partial<AgreementState> = {}): AgreementState {
  return {
    benefit: true,
    creditCollection: true,
    creditTransfer: true,
    marketing: true,
    overseasTransfer: true,
    privacy: true,
    service: true,
    ...overrides,
  };
}

const profile = {
  ageRange: 60,
  birthDate: "1962-03-04",
  name: "홍길동",
  phone: "01012345678",
};

/**
 * 항목별 동의 전송.
 *
 * <p>예전에는 여섯 항목에 동의를 받고 `termsAccepted: true` 하나만 보냈다. 백엔드에는
 * 이용약관·개인정보 두 건만 기록되고 나머지는 흔적이 없었다.
 */
describe("profileRequestBody", () => {
  it("동의 항목을 하나도 빠뜨리지 않고 보낸다", () => {
    const body = profileRequestBody({ ...profile, agreements: agreements() });

    expect(body).toMatchObject({
      benefitAccepted: true,
      creditCollectionAccepted: true,
      creditTransferAccepted: true,
      marketingAccepted: true,
      overseasTransferAccepted: true,
      privacyAccepted: true,
      termsAccepted: true,
    });
  });

  it("국외 이전에 동의하지 않으면 false 로 보낸다", () => {
    // 이 값이 기록되지 않으면 운영에서 AI 상담·음성이 막힌다.
    const body = profileRequestBody({
      ...profile,
      agreements: agreements({ overseasTransfer: false }),
    });

    expect(body.overseasTransferAccepted).toBe(false);
  });

  it("동의하지 않은 선택 항목은 false 로 보낸다", () => {
    // 기록이 없으면 수신 거부 사용자에게 보내지 않았음을 증명할 수 없다.
    const body = profileRequestBody({
      ...profile,
      agreements: agreements({ benefit: false, marketing: false }),
    });

    expect(body.marketingAccepted).toBe(false);
    expect(body.benefitAccepted).toBe(false);
  });

  it("화면의 동의 항목 수와 보내는 동의 값의 수가 같다", () => {
    // 항목이 늘었는데 전송이 빠지면 또 기록되지 않는다.
    const body = profileRequestBody({ ...profile, agreements: agreements() });
    const consentKeys = Object.keys(body).filter((key) => key.endsWith("Accepted"));

    expect(consentKeys).toHaveLength(agreementItems.length);
  });

  it("프로필 값은 그대로 싣는다", () => {
    const body = profileRequestBody({ ...profile, agreements: agreements() });

    expect(body).toMatchObject(profile);
  });
});
