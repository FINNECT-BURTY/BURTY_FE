import { backendFetch } from "@/shared/api/backendFetch";

type TokenPairPayload = Readonly<{
  success: boolean;
  data?: Readonly<{
    accessToken?: string;
    refreshToken?: string;
    accessExpiresInSeconds?: number;
    refreshExpiresInSeconds?: number;
  }>;
}>;

/**
 * HttpOnly BURTY_REFRESH 쿠키로 access/refresh 재발급 (body 불필요).
 */
export async function refreshAuthSession(): Promise<boolean> {
  const response = await backendFetch("/api/v1/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as TokenPairPayload;
  return payload.success === true;
}
