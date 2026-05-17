const BACKEND_API_BASE_URL =
  process.env.BURTY_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://44.194.3.230:8080";

function createErrorResponse(message: string, status: number) {
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

export async function GET(
  request: Request,
  context: RouteContext<"/api/auth/social/[provider]/authorize-url">,
) {
  const { provider } = await context.params;
  const normalizedProvider = provider.toUpperCase();

  if (normalizedProvider !== "KAKAO") {
    return createErrorResponse("지원하지 않는 소셜 로그인 제공자입니다.", 400);
  }

  const requestUrl = new URL(request.url);
  const state = requestUrl.searchParams.get("state");

  if (!state) {
    return createErrorResponse("state 값이 필요합니다.", 400);
  }

  try {
    const backendUrl = new URL(
      `/api/v1/auth/social/${normalizedProvider}/authorize-url`,
      BACKEND_API_BASE_URL,
    );
    backendUrl.searchParams.set("state", state);

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
    return createErrorResponse(
      "카카오 로그인 주소를 생성하지 못했습니다.",
      502,
    );
  }
}
