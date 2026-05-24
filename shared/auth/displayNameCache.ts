const DISPLAY_NAME_CACHE_KEY = "burty.user.displayName";

type DisplayNameCacheEntry = Readonly<{
  name: string;
  userId?: string;
}>;

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readCacheEntry(): DisplayNameCacheEntry | null {
  const storage = safeLocalStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(DISPLAY_NAME_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;

    const name = "name" in parsed && typeof parsed.name === "string"
      ? parsed.name.trim()
      : "";
    if (!name) return null;

    const userId =
      "userId" in parsed && typeof parsed.userId === "string"
        ? parsed.userId
        : undefined;

    return { name, userId };
  } catch {
    return null;
  }
}

export function setCachedDisplayName(name: string, userId?: string) {
  const trimmedName = name.trim();
  if (!trimmedName) return;

  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(
      DISPLAY_NAME_CACHE_KEY,
      JSON.stringify({ name: trimmedName, userId }),
    );
  } catch {
    // Storage quota 초과 등은 무시한다.
  }
}

export function getCachedDisplayName(userId?: string): string | null {
  const entry = readCacheEntry();
  if (!entry) return null;

  if (userId && entry.userId && entry.userId !== userId) {
    return null;
  }

  return entry.name;
}
