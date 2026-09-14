import { fetchApiData } from "@/shared/api/apiResponse";

/** 백엔드 `UserProfileEntity.UxMode`. */
export type UxMode = "SENIOR" | "STANDARD";

/** `GET /api/v1/users/me/settings` — 백엔드 `UserSettingsResponse`. */
export type DisplaySettings = Readonly<{
  uxMode: UxMode;
  fontScale: number;
  voiceEnabled: boolean;
}>;

export const MIN_FONT_SCALE = 1;
export const MAX_FONT_SCALE = 1.5;

/**
 * 고를 수 있는 글자 크기.
 *
 * <p>연속 슬라이더로 두지 않는다. 시니어 사용자가 미세한 값을 맞추려고 끌어야 하고,
 * 잘못 끌면 되돌리기 어렵다. 세 단계면 무엇을 고르든 결과를 바로 알 수 있다.
 */
export const fontScaleOptions = [
  { label: "보통", value: 1 },
  { label: "크게", value: 1.2 },
  { label: "아주 크게", value: 1.4 },
] as const;

export const FONT_SCALE_STORAGE_KEY = "burty.fontScale";

/**
 * 허용 범위로 자른다.
 *
 * <p>저장된 값이 손상됐거나 서버가 예상 밖의 값을 주더라도 화면이 읽을 수 없게 되면 안 된다.
 * 글자 크기는 잘못되면 설정 화면 자체를 조작할 수 없게 만드는 값이다.
 */
export function clampFontScale(value: unknown): number {
  const scale = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(scale)) return MIN_FONT_SCALE;
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, scale));
}

/** 시니어 모드를 켤 때 적용할 기본 배율. 이미 키워 둔 값은 줄이지 않는다. */
export function fontScaleForMode(mode: UxMode, current: number): number {
  if (mode === "SENIOR") return Math.max(clampFontScale(current), 1.2);
  return clampFontScale(current);
}

export function applyFontScale(scale: number): void {
  document.documentElement.style.setProperty(
    "--font-scale",
    String(clampFontScale(scale)),
  );
}

/**
 * 마지막으로 고른 배율.
 *
 * <p>서버 응답을 기다렸다가 적용하면 그 사이 화면이 기본 크기로 한 번 그려졌다가 커진다.
 * 민감한 값이 아니므로 브라우저에 두고 첫 그리기부터 적용한다.
 */
export function readStoredFontScale(): number {
  try {
    const raw = window.localStorage.getItem(FONT_SCALE_STORAGE_KEY);
    return raw === null ? MIN_FONT_SCALE : clampFontScale(raw);
  } catch {
    return MIN_FONT_SCALE;
  }
}

export function storeFontScale(scale: number): void {
  try {
    window.localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(clampFontScale(scale)));
  } catch {
    // 사생활 보호 모드 등에서 막힌다. 저장하지 못해도 이번 세션의 표시는 유지된다.
  }
}

/** 응답이 비어 있을 수 있다. 그때는 화면이 기본값으로 채운다 — 빈 응답을 오류로 만들지 않는다. */
export function fetchDisplaySettings(): Promise<DisplaySettings | null> {
  return fetchApiData<DisplaySettings>("/api/v1/users/me/settings");
}

export function updateDisplaySettings(
  input: Readonly<{ uxMode: UxMode; fontScale: number }>,
): Promise<DisplaySettings | null> {
  return fetchApiData<DisplaySettings>("/api/v1/users/me/settings", {
    body: JSON.stringify({
      fontScale: clampFontScale(input.fontScale),
      uxMode: input.uxMode,
    }),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  });
}
