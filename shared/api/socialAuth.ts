import { getPublicAppBaseUrl, getServerApiBaseUrl } from "@/shared/api/config";

const SUPPORTED_PROVIDERS = new Set(["kakao", "google", "naver", "apple"]);

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

    const appBaseUrl = getPublicAppBaseUrl(requestUrl.origin);
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

    const payload: unknown = await response.json();

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
