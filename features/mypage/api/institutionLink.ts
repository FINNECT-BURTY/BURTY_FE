import { fetchApiData } from "@/shared/api/apiResponse";

/**
 * 연결할 수 있는 기관. 표시명 표(settings.ts)와 같은 코드다.
 *
 * <p>개발·시연 환경에서는 모의 정보제공자가 모든 코드에 응답한다.
 */
export const LINKABLE_INSTITUTIONS = [
  "KB",
  "SHINHAN",
  "WOORI",
  "HANA",
  "NH",
  "IM",
  "KAKAO",
  "TOSS",
] as const;

/** `GET /api/v1/mydata/institutions/{code}/authorize` — 백엔드 `MyDataAuthorizeResponse`. */
type AuthorizeResponse = Readonly<{
  authorizeUrl?: string | null;
  institutionCode?: string | null;
}>;

/**
 * 정보제공자 인가 화면 주소를 받는다.
 *
 * <p>돌아올 FE 는 따로 알리지 않는다. 브라우저가 자동으로 붙이는 Origin·Referer 로 백엔드가
 * 알아낸다 — 커스텀 헤더를 붙이면 교차 출처 요청마다 사전 요청(preflight)이 생긴다.
 */
export async function startInstitutionLink(
  institutionCode: string,
): Promise<string> {
  const result = await fetchApiData<AuthorizeResponse>(
    `/api/v1/mydata/institutions/${encodeURIComponent(institutionCode)}/authorize`,
  );
  const url = result?.authorizeUrl;
  // http(s) 가 아닌 주소로는 보내지 않는다. 서버 응답이라도 javascript: 같은 주소가 섞이면
  // location 이동으로 그대로 실행된다.
  if (!url || !/^https?:\/\//i.test(url)) {
    throw new Error("인가 주소가 올바르지 않습니다");
  }
  return url;
}

export type LinkErrorReason = "denied" | "exchange" | "state" | "unknown";

export type LinkOutcome =
  | Readonly<{ kind: "linked"; institutionCode: string }>
  | Readonly<{
      kind: "error";
      reason: LinkErrorReason;
      institutionCode: string | null;
    }>;

type ReadableParams = Readonly<{ get(name: string): string | null }>;

/** 정보제공자에서 돌아온 결과. 백엔드 콜백이 쿼리에 실어 보낸다. */
export function readLinkOutcome(params: ReadableParams): LinkOutcome | null {
  const linked = params.get("linked");
  if (linked) return { institutionCode: linked, kind: "linked" };

  const error = params.get("link_error");
  if (!error) return null;

  const reason: LinkErrorReason =
    error === "denied" || error === "exchange" || error === "state"
      ? error
      : "unknown";
  return { institutionCode: params.get("institution"), kind: "error", reason };
}

export function describeLinkOutcome(
  outcome: LinkOutcome,
  nameOf: (code: string) => string,
): string {
  if (outcome.kind === "linked") {
    return `${withObjectParticle(nameOf(outcome.institutionCode))} 연결했어요`;
  }

  const name = outcome.institutionCode ? nameOf(outcome.institutionCode) : null;
  switch (outcome.reason) {
    case "denied":
      return name ? `${name} 연결을 취소했어요` : "연결을 취소했어요";
    case "exchange":
      return name
        ? `${name} 연결에 실패했어요. 잠시 후 다시 시도해주세요`
        : "연결에 실패했어요. 잠시 후 다시 시도해주세요";
    case "state":
      // 요청이 만료됐거나 이미 쓰였다. 같은 버튼을 다시 누르면 새 요청이 나간다.
      return "연결 요청이 만료됐어요. 처음부터 다시 시도해주세요";
    default:
      return "연결을 마치지 못했어요. 다시 시도해주세요";
  }
}

/** 아직 연결하지 않은 기관. */
export function connectableInstitutions(
  linkedCodes: readonly string[],
): readonly string[] {
  const linked = new Set(linkedCodes.map((code) => code.toUpperCase()));
  return LINKABLE_INSTITUTIONS.filter((code) => !linked.has(code));
}

/**
 * 목적격 조사. "KB국민은행을", "토스뱅크를".
 *
 * <p>받침을 보고 가른다. 한글로 끝나지 않으면 둘 다 적는다 — 틀린 조사가 붙는 것보다 낫다.
 */
export function withObjectParticle(word: string): string {
  const last = word.charCodeAt(word.length - 1);
  if (Number.isNaN(last) || last < 0xac00 || last > 0xd7a3) return `${word}을(를)`;
  return (last - 0xac00) % 28 === 0 ? `${word}를` : `${word}을`;
}
