import { ApiError, fetchApiData } from "@/shared/api/apiResponse";

/** `POST /security/webauthn/register/begin` — 백엔드 `ChallengeResponse`. */
type Challenge = Readonly<{ challengeId: string }>;

/** `POST /security/webauthn/register/finish` — 백엔드 `BiometricAuthResponse`. */
type BiometricAuth = Readonly<{
  userId?: string;
  deviceId?: string;
  deviceToken?: string | null;
  riskProof?: string | null;
  authenticated: boolean;
  trustedDevice: boolean;
}>;

export type PasskeyRegistration = Readonly<{
  deviceId?: string;
  trustedDevice: boolean;
}>;

/** 등록 응답을 기다리는 최대 시간. 넘으면 사용자에게 손을 돌려준다. */
const REGISTER_TIMEOUT_MS = 60_000;

/** 백엔드 `ErrorCode.PASSKEY_UNAVAILABLE` — 자격증명을 저장할 수 없는 계정(데모 세션). */
const PASSKEY_UNAVAILABLE_CODE = "2005";

export class PasskeyError extends Error {
  readonly reason:
    | "cancelled"
    | "duplicate"
    | "failed"
    | "rejected"
    | "timeout"
    | "unavailable"
    | "unsupported";

  constructor(reason: PasskeyError["reason"], message: string) {
    super(message);
    this.name = "PasskeyError";
    this.reason = reason;
  }
}

export function describePasskeyError(error: unknown): string {
  if (!(error instanceof PasskeyError)) return "등록에 실패했어요";

  switch (error.reason) {
    case "cancelled":
      return "등록을 취소했어요";
    case "duplicate":
      return "이 기기에는 이미 패스키가 등록돼 있어요";
    case "rejected":
      return "등록이 확인되지 않았어요. 잠시 후 다시 시도해 주세요";
    case "timeout":
      return "시간 안에 완료되지 않았어요. 다시 시도해 주세요";
    case "unavailable":
      return "이 계정에서는 패스키를 등록할 수 없어요";
    case "unsupported":
      return "이 기기에서는 패스키를 쓸 수 없어요";
    default:
      return "등록에 실패했어요";
  }
}

/**
 * 이 기기가 패스키를 만들 수 있는가.
 *
 * <p>등록 버튼을 눌러 보고서야 못 쓴다는 것을 알게 하지 않는다. 지원하지 않는 기기에서는
 * 버튼 대신 다른 방법을 안내한다.
 */
export async function isPasskeySupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential || !navigator.credentials?.create) return false;

  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    // 이 질의 자체가 실패하는 브라우저가 있다. 등록을 막지는 않는다.
    return true;
  }
}

/**
 * 패스키를 등록한다.
 *
 * <p>서버가 챌린지를 발급하고, 기기가 새 자격증명을 만들고, 서버가 검증해 기기를 등록한다.
 * 이 절차를 마쳐야 이체 같은 LEVEL_3 동작을 할 수 있다.
 */
export async function registerPasskey(
  userId: string,
  displayName: string,
): Promise<PasskeyRegistration> {
  const challenge = await fetchApiData<Challenge>(
    "/api/v1/security/webauthn/register/begin",
    {
      body: JSON.stringify({ userId }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  ).catch((error: unknown) => {
    // 등록이 애초에 불가능한 계정은 생체인증을 띄우기 전에 그 이유를 알린다.
    // 기기까지 가면 인증기가 거부한 것과 구분되지 않는 실패로 끝난다.
    if (error instanceof ApiError && error.errorCode === PASSKEY_UNAVAILABLE_CODE) {
      throw new PasskeyError("unavailable", error.message);
    }
    return null;
  });

  if (!challenge?.challengeId) {
    throw new PasskeyError("failed", "챌린지를 받지 못했습니다");
  }

  const payload = await createCredential(challenge.challengeId, userId, displayName);

  const result = await fetchApiData<BiometricAuth>(
    "/api/v1/security/webauthn/register/finish",
    {
      body: JSON.stringify({
        biometricType: biometricTypeName(),
        challengeId: challenge.challengeId,
        deviceFingerprint: deviceFingerprint(),
        payload,
        platform: platformName(),
        userId,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  ).catch(() => null);

  if (!result?.authenticated) {
    throw new PasskeyError("rejected", "등록이 확인되지 않았습니다");
  }

  return { deviceId: result.deviceId, trustedDevice: result.trustedDevice };
}

/**
 * 자격증명을 만든다.
 *
 * <p>챌린지는 서버가 준 것을 그대로 쓴다. 클라이언트가 만든 값으로 서명하면 재생 공격을
 * 막을 수 없다.
 */
async function createCredential(
  challengeId: string,
  userId: string,
  displayName: string,
): Promise<string> {
  if (typeof window === "undefined") {
    throw new PasskeyError("unsupported", "브라우저에서만 등록할 수 있습니다");
  }

  if (!window.PublicKeyCredential || !navigator.credentials?.create) {
    return fallbackPayload(challengeId);
  }

  const abort = new AbortController();
  const timer = window.setTimeout(() => abort.abort(), REGISTER_TIMEOUT_MS);

  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: new TextEncoder().encode(challengeId),
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },
          { alg: -257, type: "public-key" },
        ],
        rp: { id: window.location.hostname, name: "BURTY" },
        timeout: REGISTER_TIMEOUT_MS,
        user: {
          displayName,
          id: new TextEncoder().encode(userId),
          name: displayName,
        },
      },
      signal: abort.signal,
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new PasskeyError("failed", "자격증명을 만들지 못했습니다");
    }

    return JSON.stringify(credential.toJSON?.() ?? credential);
  } catch (error) {
    if (error instanceof PasskeyError) throw error;

    if (error instanceof DOMException) {
      // 취소·중복·시간초과를 구분한다. 사용자가 다음에 할 일이 각각 다르다.
      if (error.name === "AbortError") {
        throw new PasskeyError("timeout", "시간 안에 완료되지 않았습니다");
      }
      if (error.name === "NotAllowedError") {
        throw new PasskeyError("cancelled", "사용자가 등록을 취소했습니다");
      }
      if (error.name === "InvalidStateError") {
        throw new PasskeyError("duplicate", "이미 등록된 기기입니다");
      }
    }

    throw new PasskeyError("failed", "자격증명을 만들지 못했습니다");
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * 기기 식별값.
 *
 * <p>브라우저 지문을 정교하게 만들지 않는다. 서버가 같은 기기를 알아보는 데만 쓰이고,
 * 값 자체는 이 브라우저에 남는다. 사용자를 추적하는 용도가 아니다.
 */
const FINGERPRINT_KEY = "burty.device.fingerprint";

function deviceFingerprint(): string {
  try {
    const saved = window.localStorage.getItem(FINGERPRINT_KEY);
    if (saved) return saved;

    const created = crypto.randomUUID();
    window.localStorage.setItem(FINGERPRINT_KEY, created);
    return created;
  } catch {
    // 저장이 막힌 브라우저(사생활 보호 모드 등). 등록 자체를 막지는 않는다.
    return crypto.randomUUID();
  }
}

/**
 * 인증기가 없는 환경용 페이로드.
 *
 * <p>서명도 attestation 도 없으므로 <b>운영 검증기는 통과하지 못한다.</b> 개발 환경
 * (`burty.webauthn.stub-mode=true`)에서 인증기 없이 흐름을 돌려보기 위한 것이고,
 * 조용히 통과하는 경로가 아니다. 이체 쪽 `stepUpForTransfer` 와 같은 방식이다.
 */
function fallbackPayload(challengeId: string): string {
  return JSON.stringify({
    attestationObject: "",
    challenge: challengeId,
    origin: window.location.origin,
    rpId: window.location.hostname,
  });
}

function platformName(): string {
  if (typeof navigator === "undefined") return "WEB";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "IOS";
  if (/Android/i.test(ua)) return "ANDROID";
  return "WEB";
}

function biometricTypeName(): string {
  if (typeof navigator === "undefined") return "PLATFORM";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Macintosh/i.test(ua)) return "FACE_OR_TOUCH_ID";
  if (/Android/i.test(ua)) return "FINGERPRINT";
  return "PLATFORM";
}
