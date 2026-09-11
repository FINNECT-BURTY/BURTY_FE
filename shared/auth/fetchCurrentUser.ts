import { backendFetch, hydrateAuthTokensFromCookieSession } from "@/shared/api/backendFetch";
import type { CurrentUser } from "@/shared/auth/currentUser";
import { getCachedDisplayName } from "@/shared/auth/displayNameCache";
import { ensureAuthTokensForUser } from "@/shared/auth/ensureAuthTokens";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  restoreAuthTokens,
} from "@/shared/auth/tokenStorage";

type CurrentUserResponse = Readonly<{
  success: boolean;
  data?: unknown;
}>;

const AUTH_ME_ENDPOINT = "/api/v1/auth/me";

// /auth/me 응답은 userId / profileComplete 만 포함하므로
// 표시 이름은 별도 프로필 엔드포인트에서 보충한다.
const USER_NAME_ENDPOINT = "/api/v1/users/me/name";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, key: string) {
  if (!isRecord(value)) return null;

  const candidate = value[key];
  return typeof candidate === "string" ? candidate : null;
}

function readBoolean(value: unknown, key: string) {
  if (!isRecord(value)) return undefined;

  const candidate = value[key];
  return typeof candidate === "boolean" ? candidate : undefined;
}

function readNestedRecord(value: unknown, key: string) {
  if (!isRecord(value)) return null;

  const candidate = value[key];
  return isRecord(candidate) ? candidate : null;
}

function resolveProfileData(data: unknown) {
  const user = readNestedRecord(data, "user");
  const profile = readNestedRecord(data, "profile");
  const userProfile = readNestedRecord(data, "userProfile");
  const userProfileSnakeCase = readNestedRecord(data, "user_profile");
  const member = readNestedRecord(data, "member");
  const account = readNestedRecord(data, "account");

  return [data, userProfile, userProfileSnakeCase, profile, user, member, account];
}

function resolveDisplayName(data: unknown) {
  const nameSources = resolveProfileData(data);
  const nameKeys = [
    "name",
    "realName",
    "userName",
    "username",
    "nickname",
    "nickName",
    "displayName",
  ] as const;

  for (const source of nameSources) {
    for (const key of nameKeys) {
      const trimmedDisplayName = readString(source, key)?.trim();

      if (trimmedDisplayName) return trimmedDisplayName;
    }
  }

  return null;
}

function resolveUserId(data: unknown) {
  const user = readNestedRecord(data, "user");
  const member = readNestedRecord(data, "member");

  return (
    readString(data, "userId") ??
    readString(user, "userId") ??
    readString(member, "userId") ??
    undefined
  );
}

function resolveProfileComplete(data: unknown) {
  const user = readNestedRecord(data, "user");
  const profile = readNestedRecord(data, "profile");

  return (
    readBoolean(data, "profileComplete") ??
    readBoolean(user, "profileComplete") ??
    readBoolean(profile, "completed")
  );
}

async function fetchJson(endpoint: string) {
  const response = await backendFetch(endpoint, {
    cache: "no-store",
    method: "GET",
  });
  const payload = (await response.json().catch(() => null)) as
    | CurrentUserResponse
    | null;

  if (!response.ok || payload?.success !== true) return null;

  return payload.data;
}

async function fetchNameFromApi() {
  const response = await backendFetch(USER_NAME_ENDPOINT, {
    cache: "no-store",
    method: "GET",
  });
  const payload = (await response.json().catch(() => null)) as
    | (CurrentUserResponse & { errorCode?: string | null })
    | null;

  if (!response.ok || payload?.success !== true) {
    return null;
  }

  return resolveDisplayName(payload.data);
}

/**
 * 표시 이름을 보조 엔드포인트에서 채운다.
 *
 * <p>이름 조회는 <b>표시용</b>이다. 여기서 실패했다고 인증 상태를 건드리면 안 된다.
 *
 * <p>예전에는 이름을 못 받으면 곧바로 토큰을 지우고 쿠키 세션으로 다시 맞추려 했다.
 * 쿠키 세션이 없는 사용자(이메일 로그인·테스트 토큰)는 그 자리에서 <b>유효한 토큰을 잃고</b>
 * 화면 전체가 미인증이 됐다. 프로필 행이 없는 계정에서 홈이 통째로 "불러오지 못했어요" 가
 * 되는 형태로 드러났다.
 *
 * <p>쿠키 세션으로 다시 맞추는 시도는 남기되, 실패하면 원래 토큰을 있던 그대로 되돌린다.
 * 한 쌍일 때만 되돌리면 refresh 토큰이 없는 세션(테스트 토큰)은 여기서 access 토큰을 잃는다.
 */
async function fetchDisplayNameFromNameEndpoint(userId?: string) {
  try {
    await ensureAuthTokensForUser(userId);

    const name = await fetchNameFromApi();
    if (name) return name;

    const savedTokens = {
      accessToken: getAccessToken(),
      refreshToken: getRefreshToken(),
    };

    // Bearer 가 남아 있으나 쿠키 세션과 어긋난 경우를 한 번 더 시도한다.
    clearAuthTokens();
    const rehydrated = await hydrateAuthTokensFromCookieSession();

    if (!rehydrated) {
      restoreAuthTokens(savedTokens);
      return null;
    }

    return await fetchNameFromApi();
  } catch {
    return null;
  }
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const authData = await fetchJson(AUTH_ME_ENDPOINT);
  if (!authData) return null;

  const userId = resolveUserId(authData);
  await ensureAuthTokensForUser(userId);

  const displayName =
    resolveDisplayName(authData) ??
    (await fetchDisplayNameFromNameEndpoint(userId)) ??
    getCachedDisplayName(userId) ??
    "고객";

  return {
    displayName,
    profileComplete: resolveProfileComplete(authData),
    userId,
  };
}
