import { backendFetch } from "@/shared/api/backendFetch";

/**
 * 청년정책 도메인.
 * 백엔드 `/api/v1/youth-policies/search?domain=...` 의 허용 값과 1:1 매칭한다.
 */
export type YouthPolicyDomain = "finance" | "housing" | "welfare" | "subsidy";

/**
 * 백엔드 `YouthPolicySummary` 응답.
 * 빈 문자열 / 누락 가능성이 높아 전부 optional 로 둔다.
 */
export type YouthPolicySummary = Readonly<{
  id: string;
  title: string;
  keywords?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  supportContent?: string;
  supervisingOrg?: string;
  operatingOrg?: string;
  startDate?: string;
  endDate?: string;
  applyMethod?: string;
  applyUrl?: string;
  referenceUrl?: string;
  applyDeadline?: string;
  registeredAt?: string;
  updatedAt?: string;
}>;

export type YouthPolicyPageResult = Readonly<{
  hasMore: boolean;
  page: number;
  policies: readonly YouthPolicySummary[];
  totalElements: number;
}>;

type YouthPolicyListResponse = Readonly<{
  success?: boolean;
  data?: Readonly<{
    content?: YouthPolicySummary[];
    last?: boolean;
    number?: number;
    totalElements?: number;
    totalPages?: number;
  }> | null;
}>;

type FetchYouthPoliciesParams = Readonly<{
  domain?: YouthPolicyDomain;
  keyword?: string;
  page?: number;
  size?: number;
}>;

const SEARCH_ENDPOINT = "/api/v1/youth-policies/search";

const EMPTY_PAGE_RESULT: YouthPolicyPageResult = {
  hasMore: false,
  page: 0,
  policies: [],
  totalElements: 0,
};

function resolveHasMore(
  data: NonNullable<YouthPolicyListResponse["data"]>,
  page: number,
): boolean {
  if (typeof data.last === "boolean") {
    return !data.last;
  }

  if (typeof data.totalPages === "number") {
    return page + 1 < data.totalPages;
  }

  return false;
}

export async function fetchYouthPoliciesPage(
  params: FetchYouthPoliciesParams = {},
): Promise<YouthPolicyPageResult> {
  const page = params.page ?? 0;
  const query = new URLSearchParams();
  if (params.domain) query.set("domain", params.domain);
  if (params.keyword) query.set("keyword", params.keyword);
  query.set("page", String(page));
  query.set("size", String(params.size ?? 30));

  try {
    const response = await backendFetch(`${SEARCH_ENDPOINT}?${query.toString()}`, {
      cache: "no-store",
      method: "GET",
    });

    const json = (await response.json().catch(() => null)) as
      | YouthPolicyListResponse
      | null;

    if (!response.ok || json?.success !== true || !json.data) {
      return EMPTY_PAGE_RESULT;
    }

    const content = json.data.content;
    const policies = Array.isArray(content) ? content : [];

    return {
      hasMore: resolveHasMore(json.data, page),
      page: json.data.number ?? page,
      policies,
      totalElements: json.data.totalElements ?? policies.length,
    };
  } catch (error) {
    console.error("Failed to fetch youth policies:", error);
    return EMPTY_PAGE_RESULT;
  }
}
