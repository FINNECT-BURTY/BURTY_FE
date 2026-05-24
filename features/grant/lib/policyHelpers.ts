import type { YouthPolicySummary } from "@/features/grant/api/youthPolicy";

const YYYYMMDD_REGEX = /^(\d{4})(\d{2})(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_HASHTAGS = 3;

/**
 * "20261231" 형식 문자열을 로컬 자정 Date 로 파싱한다.
 * 빈 값 / 잘못된 형식이면 null.
 */
export function parseYyyymmdd(value: string | null | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  const match = YYYYMMDD_REGEX.exec(trimmed);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatPolicyDateKor(
  value: string | null | undefined,
): string | null {
  const date = parseYyyymmdd(value);
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}.`;
}

/**
 * 오늘로부터 마감일까지 남은 일 수.
 * 음수는 이미 지난 마감을 의미한다.
 */
export function getDaysUntil(
  value: string | null | undefined,
  now: Date = new Date(),
): number | null {
  const target = parseYyyymmdd(value);
  if (!target) return null;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetMidnight = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  return Math.round((targetMidnight.getTime() - today.getTime()) / MS_PER_DAY);
}

/**
 * 정책 응답에서 신청 URL 을 가능한 우선순위로 뽑는다.
 * applyUrl 이 비어있는 경우가 흔해서 referenceUrl 로 fallback 한다.
 */
export function resolvePolicyUrl(
  policy: Pick<YouthPolicySummary, "applyUrl" | "referenceUrl">,
): string | null {
  const apply = policy.applyUrl?.trim();
  if (apply) return apply;

  const reference = policy.referenceUrl?.trim();
  if (reference) return reference;

  return null;
}

/**
 * 정책 응답에서 해시태그용 키워드를 뽑는다.
 * keywords 는 "보조금,주거지원" 같이 콤마 구분된 단순 문자열.
 * subCategory 도 함께 활용한다.
 */
export function extractHashtags(
  policy: Pick<YouthPolicySummary, "keywords" | "subCategory">,
): string[] {
  const tags = new Set<string>();

  if (policy.keywords) {
    for (const piece of policy.keywords.split(/[,;·•/]/)) {
      const trimmed = piece.trim();
      if (trimmed) tags.add(trimmed);
    }
  }

  if (policy.subCategory) {
    const trimmed = policy.subCategory.trim();
    if (trimmed) tags.add(trimmed);
  }

  return Array.from(tags).slice(0, MAX_HASHTAGS);
}

/**
 * 상위 추천 카드용 정책 1개를 고른다.
 * - 오늘 기준 endDate 가 미래인 정책 중 가장 임박한 것
 * - 없으면 입력 배열의 첫 정책
 * - 모두 비었으면 null
 */
export function pickFeaturedPolicy(
  policies: readonly YouthPolicySummary[],
  now: Date = new Date(),
): YouthPolicySummary | null {
  const future: { policy: YouthPolicySummary; days: number }[] = [];

  for (const policy of policies) {
    const days = getDaysUntil(policy.endDate, now);
    if (days !== null && days >= 0) {
      future.push({ policy, days });
    }
  }

  future.sort((a, b) => a.days - b.days);
  return future[0]?.policy ?? policies[0] ?? null;
}
