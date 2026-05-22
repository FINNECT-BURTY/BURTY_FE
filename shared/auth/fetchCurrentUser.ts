import { backendFetch } from "@/shared/api/backendFetch";
import type { CurrentUser } from "@/shared/auth/currentUser";

type CurrentUserResponse = Readonly<{
  success: boolean;
  data?: unknown;
}>;

const AUTH_ME_ENDPOINT = "/api/v1/auth/me";

// TODO: 백엔드에서 프로필 조회 endpoint를 받으면 여기에 추가한다.
// 예: "/api/v1/users/me/profile"
const USER_PROFILE_ENDPOINTS: readonly string[] = [];

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

async function resolveDisplayNameFromProfileEndpoints() {
  for (const endpoint of USER_PROFILE_ENDPOINTS) {
    const data = await fetchJson(endpoint);
    const displayName = resolveDisplayName(data);

    if (displayName) return displayName;
  }

  return null;
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const authData = await fetchJson(AUTH_ME_ENDPOINT);
  if (!authData) return null;

  const displayName =
    resolveDisplayName(authData) ??
    (await resolveDisplayNameFromProfileEndpoints()) ??
    "고객";

  return {
    displayName,
    profileComplete: resolveProfileComplete(authData),
    userId: resolveUserId(authData),
  };
}
