import { fetchApiData } from "@/shared/api/apiResponse";

/** `POST /security/webauthn/authenticate/begin` — 백엔드 `ChallengeResponse`. */
type Challenge = Readonly<{ challengeId: string }>;

/** `POST /security/webauthn/authenticate/finish` — 백엔드 `BiometricAuthResponse`. */
type BiometricAuth = Readonly<{
  userId?: string;
  deviceId?: string;
  deviceToken?: string | null;
  accessToken?: string | null;
  riskProof?: string | null;
  authenticated: boolean;
  trustedDevice: boolean;
}>;

/**
 * LEVEL_3 단계 인증 결과.
 *
 * <p>`riskProof` 는 `X-Risk-Proof` 헤더로 보내는 단계 인증 증명이다. `assertionToken` 은
 * 요청 본문에 묶어 보내는 서명으로, 이체처럼 요청 자체에 서명이 필요한 곳에서만 쓴다.
 */
export type StepUpResult = Readonly<{
  assertionToken: string;
  riskProof: string;
}>;

/** 생체인증 응답을 기다리는 최대 시간. 넘으면 사용자에게 알리고 손을 돌려준다. */
const STEP_UP_TIMEOUT_MS = 45_000;

export class StepUpError extends Error {
  readonly reason: "cancelled" | "unsupported" | "rejected" | "failed" | "timeout";

  constructor(reason: StepUpError["reason"], message: string) {
    super(message);
    this.name = "StepUpError";
    this.reason = reason;
  }
}

export function describeStepUpError(error: unknown): string {
  if (!(error instanceof StepUpError)) return "인증에 실패했어요";

  switch (error.reason) {
    case "cancelled":
      return "인증을 취소했어요";
    case "unsupported":
      return "이 기기에서는 생체인증을 쓸 수 없어요";
    case "rejected":
      return "인증이 확인되지 않았어요. 등록된 생체인증이 있는지 확인해 주세요";
    case "timeout":
      return "인증이 완료되지 않았어요. 다시 시도해 주세요";
    default:
      return "인증에 실패했어요";
  }
}

/**
 * 생체인증으로 LEVEL_3 증명을 받는다.
 *
 * <p>이체, 회원 탈퇴처럼 되돌릴 수 없는 동작 직전에 부른다. LEVEL_3 증명은 LEVEL_2 가
 * 필요한 곳에서도 통하므로(백엔드 `RiskProofService.isAllowedFor`) 한 번 받으면 된다.
 *
 * <p>서버가 챌린지를 발급하고, 기기가 서명하고, 서버가 검증해 증명을 준다. 챌린지는
 * 서버가 준 것을 그대로 쓴다 — 클라이언트가 만든 값으로 서명하면 재생 공격을 막을 수 없다.
 */
export async function stepUpWithBiometrics(userId: string): Promise<StepUpResult> {
  const challenge = await fetchApiData<Challenge>(
    "/api/v1/security/webauthn/authenticate/begin",
    {
      body: JSON.stringify({ userId }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  ).catch(() => null);

  if (!challenge?.challengeId) {
    throw new StepUpError("failed", "챌린지를 받지 못했습니다");
  }

  const payload = await signChallenge(challenge.challengeId);

  const result = await fetchApiData<BiometricAuth>(
    "/api/v1/security/webauthn/authenticate/finish",
    {
      body: JSON.stringify({
        challengeId: challenge.challengeId,
        payload,
        platform: platformName(),
        userId,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  ).catch(() => null);

  if (!result?.authenticated || !result.riskProof) {
    throw new StepUpError("rejected", "인증이 확인되지 않았습니다");
  }

  return { assertionToken: payload, riskProof: result.riskProof };
}

/**
 * 챌린지에 서명한다.
 *
 * <p>패스키가 등록돼 있으면 브라우저 WebAuthn 으로 서명한다. 등록된 자격증명이 없거나
 * 브라우저가 지원하지 않으면 서버가 검증할 수 있는 형태의 페이로드를 그대로 만든다 —
 * 개발 환경(`burty.webauthn.stub-mode=true`)에서만 통과하며, 운영에서는 서명이 없으므로
 * 서버가 거부한다. 조용히 통과하는 경로가 아니다.
 */
async function signChallenge(challengeId: string): Promise<string> {
  if (typeof window === "undefined") {
    throw new StepUpError("unsupported", "브라우저에서만 인증할 수 있습니다");
  }

  if (!window.PublicKeyCredential || !navigator.credentials?.get) {
    return fallbackPayload(challengeId);
  }

  // 브라우저가 응답하지 않으면 요청을 끊는다. 없으면 버튼이 "보내는 중" 상태로 멈춰
  // 사용자가 아무것도 할 수 없다 — 돈을 보내는 화면에서 특히 나쁘다.
  const abort = new AbortController();
  const timer = window.setTimeout(() => abort.abort(), STEP_UP_TIMEOUT_MS);

  try {
    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge: new TextEncoder().encode(challengeId),
        rpId: window.location.hostname,
        timeout: STEP_UP_TIMEOUT_MS,
        userVerification: "preferred",
      },
      signal: abort.signal,
    })) as PublicKeyCredential | null;

    if (!credential) {
      return fallbackPayload(challengeId);
    }

    return JSON.stringify(credential.toJSON?.() ?? credential);
  } catch (error) {
    // 사용자가 직접 취소한 것과 자격증명이 없는 것을 구분한다.
    // 취소는 되돌릴 수 있는 상황이므로 그대로 알리고, 미등록은 폴백으로 넘긴다.
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new StepUpError("timeout", "인증이 시간 안에 완료되지 않았습니다");
    }
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      throw new StepUpError("cancelled", "사용자가 인증을 취소했습니다");
    }
    return fallbackPayload(challengeId);
  } finally {
    window.clearTimeout(timer);
  }
}

/** 패스키가 없는 환경용 페이로드. 서명이 없으므로 운영 검증기는 통과하지 못한다. */
function fallbackPayload(challengeId: string): string {
  return JSON.stringify({
    challenge: challengeId,
    origin: window.location.origin,
    rpId: window.location.hostname,
    signature: "",
  });
}

function platformName(): string {
  if (typeof navigator === "undefined") return "WEB";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "IOS";
  if (/Android/i.test(ua)) return "ANDROID";
  return "WEB";
}
