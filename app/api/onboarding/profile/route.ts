import { getServerApiBaseUrl } from "@/shared/api/config";

function createErrorResponse(message: string, status: number) {
  return Response.json(
    {
      success: false,
      message,
      data: null,
      errorCode: "ONBOARDING_PROFILE_FAILED",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
      status,
    },
  );
}

/**
 * 서버 사이드 프록시 (쿠키는 브라우저 → API 직접 호출 시에만 동작).
 * 클라이언트는 {@link backendFetch} 로 BURTY API 를 직접 호출하는 것을 권장.
 */
export async function POST(request: Request) {
  try {
    const backendUrl = new URL("/api/v1/onboarding/profile", getServerApiBaseUrl());
    const cookie = request.headers.get("cookie");

    const response = await fetch(backendUrl, {
      body: await request.text(),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      method: "POST",
    });

    const payload: unknown = await response.json();

    return Response.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
      status: response.status,
    });
  } catch {
    return createErrorResponse("추가 정보를 저장하지 못했습니다.", 502);
  }
}
