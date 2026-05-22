import { getPublicAppBaseUrl, getServerApiBaseUrl } from "@/shared/api/config";

const SUPPORTED_PROVIDERS = new Set(["kakao", "google", "naver", "apple"]);
const LOCALHOST_ORIGIN_PATTERNS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
] as const;

type SocialAuthorizePayload = Readonly<{
  data?: Readonly<{
    authorizeUrl?: string;
  }> | null;
}>;

function isSocialAuthorizePayload(value: unknown): value is SocialAuthorizePayload {
  return typeof value === "object" && value !== null;
}

function getRequestOrigin(request: Request, requestUrl: URL) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.headers.get("origin") ?? requestUrl.origin;
}

function replaceAll(value: string, searchValue: string, replaceValue: string) {
  return value.split(searchValue).join(replaceValue);
}

function normalizeAuthorizeUrl(authorizeUrl: string, appBaseUrl: string) {
  return LOCALHOST_ORIGIN_PATTERNS.reduce((normalizedUrl, localhostOrigin) => {
    const encodedLocalhostOrigin = encodeURIComponent(localhostOrigin);
    const encodedAppBaseUrl = encodeURIComponent(appBaseUrl);

    return replaceAll(
      replaceAll(normalizedUrl, localhostOrigin, appBaseUrl),
      encodedLocalhostOrigin,
      encodedAppBaseUrl,
    );
  }, authorizeUrl);
}

function normalizePayloadAuthorizeUrl(payload: unknown, appBaseUrl: string) {
  if (!isSocialAuthorizePayload(payload)) return payload;

  const authorizeUrl = payload.data?.authorizeUrl;
  if (!authorizeUrl) return payload;

  return {
    ...payload,
    data: {
      ...payload.data,
      authorizeUrl: normalizeAuthorizeUrl(authorizeUrl, appBaseUrl),
    },
  };
}

export function createSocialAuthorizeErrorResponse(message: string, status: number) {
  return Response.json(
    {
      success: false,
      message,
      data: null,
      errorCode: "SOCIAL_AUTHORIZE_URL_FAILED",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
      status,
    },
  );
}

export async function handleSocialAuthorizeUrlRequest(
  request: Request,
  provider: string,
) {
  const normalizedProvider = provider.toLowerCase();

  if (!SUPPORTED_PROVIDERS.has(normalizedProvider)) {
    return createSocialAuthorizeErrorResponse(
      "지원하지 않는 소셜 로그인 제공자입니다.",
      400,
    );
  }

  const requestUrl = new URL(request.url);
  const state = requestUrl.searchParams.get("state");

  try {
    const backendUrl = new URL(
      `/api/v1/auth/${normalizedProvider}/authorize-url`,
      getServerApiBaseUrl(),
    );
    if (state) {
      backendUrl.searchParams.set("state", state);
    }

    const appBaseUrl = getPublicAppBaseUrl(getRequestOrigin(request, requestUrl));
    const appCallbackUrl = new URL("/auth/callback", appBaseUrl).toString();

    const response = await fetch(backendUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Origin: appBaseUrl,
        Referer: appCallbackUrl,
        "X-Forwarded-Host": new URL(appBaseUrl).host,
        "X-Forwarded-Proto": new URL(appBaseUrl).protocol.replace(":", ""),
        "X-Redirect-Uri": appCallbackUrl,
      },
    });

    const payload: unknown = normalizePayloadAuthorizeUrl(
      await response.json(),
      appBaseUrl,
    );

    return Response.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
      status: response.status,
    });
  } catch {
    return createSocialAuthorizeErrorResponse(
      "소셜 로그인 주소를 생성하지 못했습니다.",
      502,
    );
  }
}
