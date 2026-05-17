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

export async function POST(request: Request) {
  try {
    const backendUrl = new URL("/api/v1/onboarding/profile", BACKEND_API_BASE_URL);
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
