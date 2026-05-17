const BACKEND_API_BASE_URL =
  process.env.BURTY_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://44.194.3.230:8080";

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
  const redirectUri = requestUrl.searchParams.get("redirectUri");

  if (!state) {
    return createSocialAuthorizeErrorResponse("state 값이 필요합니다.", 400);
  }

  try {
    const backendUrl = new URL(
      `/api/v1/auth/${normalizedProvider}/authorize-url`,
      BACKEND_API_BASE_URL,
    );
    backendUrl.searchParams.set("state", state);
    if (redirectUri) {
      backendUrl.searchParams.set("redirectUri", redirectUri);
    }

    const response = await fetch(backendUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
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
