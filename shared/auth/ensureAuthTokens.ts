import { hydrateAuthTokensFromCookieSession } from "@/shared/api/backendFetch";
import { isJwtExpired, readJwtSubject } from "@/shared/auth/jwtSubject";
import {
  clearAuthTokens,
  getAccessToken,
  hasAuthTokens,
} from "@/shared/auth/tokenStorage";

/**
 * `/auth/me` 의 userId 와 localStorage Bearer sub 가 다르면 토큰을 비우고
 * BFF 쿠키 세션(refresh)으로 다시 맞춘다.
 */
export async function ensureAuthTokensForUser(userId?: string): Promise<void> {
  if (hasAuthTokens()) {
    const accessToken = getAccessToken();
    const subject = accessToken ? readJwtSubject(accessToken) : null;

    if (
      !accessToken ||
      isJwtExpired(accessToken) ||
      (userId && subject && subject !== userId)
    ) {
      clearAuthTokens();
    }
  }

  if (!hasAuthTokens()) {
    await hydrateAuthTokensFromCookieSession();
  }
}
