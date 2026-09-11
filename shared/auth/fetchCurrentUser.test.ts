import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/backendFetch", () => ({
  backendFetch: vi.fn(),
  hydrateAuthTokensFromCookieSession: vi.fn(),
}));

vi.mock("@/shared/auth/ensureAuthTokens", () => ({
  ensureAuthTokensForUser: vi.fn(),
}));

const { backendFetch, hydrateAuthTokensFromCookieSession } = await import(
  "@/shared/api/backendFetch"
);
const { fetchCurrentUser } = await import("@/shared/auth/fetchCurrentUser");
const { getAccessToken, getRefreshToken, setAuthTokens } = await import(
  "@/shared/auth/tokenStorage"
);

const ACCESS_TOKEN_KEY = "burty.auth.accessToken";
const REFRESH_TOKEN_KEY = "burty.auth.refreshToken";

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, String(value));
    },
  };
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

let storage: Storage;

/** 이름 조회는 프로필이 없어 404 이고, 쿠키 세션도 없다. */
function nameLookupFailsWithoutCookieSession() {
  vi.mocked(backendFetch).mockImplementation(async (endpoint) =>
    endpoint === "/api/v1/auth/me"
      ? json(200, { data: { profileComplete: true, userId: "1" }, success: true })
      : json(404, { errorCode: "3000", success: false }),
  );
  vi.mocked(hydrateAuthTokensFromCookieSession).mockResolvedValue(false);
}

beforeEach(() => {
  storage = memoryStorage();
  vi.stubGlobal("window", { localStorage: storage });
  vi.mocked(backendFetch).mockReset();
  vi.mocked(hydrateAuthTokensFromCookieSession).mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * 이름 조회가 실패했을 때 토큰을 지키는가.
 *
 * <p>이름은 표시용이다. 이름을 못 받았다고 유효한 access 토큰을 잃으면 이후 요청이 토큰 없이
 * 나가 화면 전체가 미인증이 된다. refresh 토큰이 없는 세션(테스트 토큰)에서 그랬다.
 */
describe("fetchCurrentUser — 이름 조회 실패", () => {
  it("refresh 토큰이 비어 있어도 access 토큰을 되돌린다", async () => {
    storage.setItem(ACCESS_TOKEN_KEY, "access-1");
    storage.setItem(REFRESH_TOKEN_KEY, "");
    nameLookupFailsWithoutCookieSession();

    const user = await fetchCurrentUser();

    expect(user?.displayName).toBe("고객");
    expect(getAccessToken()).toBe("access-1");
    expect(getRefreshToken()).toBe("");
  });

  it("refresh 토큰이 없던 세션은 없는 그대로 되돌린다", async () => {
    storage.setItem(ACCESS_TOKEN_KEY, "access-1");
    nameLookupFailsWithoutCookieSession();

    await fetchCurrentUser();

    expect(getAccessToken()).toBe("access-1");
    // 없던 refresh 토큰을 빈 문자열로 만들어 넣으면 "한 쌍이 있다" 로 읽힌다.
    expect(getRefreshToken()).toBeNull();
  });

  it("한 쌍이던 토큰은 한 쌍 그대로 되돌린다", async () => {
    setAuthTokens({ accessToken: "access-1", refreshToken: "refresh-1" });
    nameLookupFailsWithoutCookieSession();

    await fetchCurrentUser();

    expect(getAccessToken()).toBe("access-1");
    expect(getRefreshToken()).toBe("refresh-1");
  });

  it("쿠키 세션으로 다시 맞춰지면 새 토큰과 이름을 쓴다", async () => {
    setAuthTokens({ accessToken: "stale", refreshToken: "stale-refresh" });
    let nameCalls = 0;
    vi.mocked(backendFetch).mockImplementation(async (endpoint) => {
      if (endpoint === "/api/v1/auth/me") {
        return json(200, { data: { userId: "1" }, success: true });
      }
      nameCalls += 1;
      return nameCalls === 1
        ? json(404, { success: false })
        : json(200, { data: { name: "검증사용자" }, success: true });
    });
    vi.mocked(hydrateAuthTokensFromCookieSession).mockImplementation(async () => {
      setAuthTokens({ accessToken: "fresh", refreshToken: "fresh-refresh" });
      return true;
    });

    const user = await fetchCurrentUser();

    expect(user?.displayName).toBe("검증사용자");
    expect(getAccessToken()).toBe("fresh");
    expect(getRefreshToken()).toBe("fresh-refresh");
  });
});
