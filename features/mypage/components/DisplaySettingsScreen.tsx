"use client";

import { useCallback, useEffect, useState } from "react";

import {
  applyFontScale,
  clampFontScale,
  fetchDisplaySettings,
  fontScaleForMode,
  fontScaleOptions,
  readStoredFontScale,
  storeFontScale,
  updateDisplaySettings,
  type UxMode,
} from "@/features/mypage/api/display";
import { SettingsScreenShell } from "@/features/mypage/ui/SettingsScreenShell";
import { useBackendQuery } from "@/shared/hooks/useBackendQuery";

type PickedSettings = Readonly<{ fontScale: number; uxMode: UxMode }>;

/**
 * 글자 크기와 간편 모드.
 *
 * <p>백엔드는 가입할 때부터 {@code ux_mode} 와 {@code font_scale} 을 갖고 있었지만 읽거나 바꿀
 * 방법이 없었다. 시니어 대상 서비스인데 글자 크기를 바꿀 수 없는 상태였다 (#134).
 *
 * <p>고른 값은 바로 적용하고 저장은 뒤따라간다. 저장을 기다렸다 키우면 느린 회선에서 눌러도
 * 아무 일이 없는 것처럼 보인다. 저장에 실패하면 알리되 화면은 되돌리지 않는다 — 되돌리면
 * 방금 한 조작이 취소된 것처럼 보인다.
 */
export function DisplaySettingsScreen() {
  const fetcher = useCallback(() => fetchDisplaySettings(), []);
  const { data, error, isInitialLoading, refetch } = useBackendQuery(fetcher);

  // 사용자가 고른 값. 고르기 전에는 서버 값을, 서버 값도 없으면 저장해 둔 값을 쓴다.
  const [picked, setPicked] = useState<PickedSettings | null>(null);
  const [storedScale] = useState(() =>
    typeof window === "undefined" ? 1 : readStoredFontScale(),
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const fontScale = clampFontScale(
    picked?.fontScale ?? data?.fontScale ?? storedScale,
  );
  const uxMode: UxMode = picked?.uxMode ?? data?.uxMode ?? "STANDARD";

  // 서버 값이 도착하면 그 배율로 맞춘다. 다른 기기에서 바꾼 설정이 여기에도 반영된다.
  useEffect(() => {
    if (!data || picked) return;
    const scale = clampFontScale(data.fontScale);
    applyFontScale(scale);
    storeFontScale(scale);
  }, [data, picked]);

  const save = async (next: PickedSettings) => {
    setPicked(next);
    applyFontScale(next.fontScale);
    storeFontScale(next.fontScale);
    setSaveError(null);

    try {
      await updateDisplaySettings(next);
    } catch {
      setSaveError("설정을 저장하지 못했어요. 앱을 다시 열면 이전 설정으로 돌아갈 수 있어요.");
    }
  };

  return (
    <SettingsScreenShell
      description="글자가 작아 보이면 크기를 키워 보세요. 앱 전체에 바로 적용돼요."
      errorMessage="설정을 불러오지 못했어요"
      hasError={Boolean(error)}
      // 불러오지 못해도 조작은 할 수 있어야 한다. 저장해 둔 배율로 화면을 띄운다.
      isEmpty={false}
      isInitialLoading={isInitialLoading}
      onRetry={refetch}
      title="글자 크기 및 화면"
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-title-sm text-grayscale-1000">글자 크기</h2>
          <div aria-label="글자 크기" className="mt-3 space-y-3" role="radiogroup">
            {fontScaleOptions.map((option) => {
              const isSelected = fontScale === option.value;

              return (
                <button
                  aria-checked={isSelected}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-5 text-left ${
                    isSelected
                      ? "border-espresso bg-yellow-100"
                      : "border-grayscale-100 bg-background"
                  }`}
                  key={option.label}
                  onClick={() =>
                    void save({ fontScale: option.value, uxMode })
                  }
                  role="radio"
                  type="button"
                >
                  {/* 배율을 글자 자체에 적용해 고르기 전에 결과를 보여준다. */}
                  <span
                    className="min-w-0 truncate text-grayscale-1000"
                    style={{ fontSize: `calc(${option.value} * 16px)` }}
                  >
                    {option.label}
                  </span>
                  <span className="text-caption shrink-0 text-grayscale-600">
                    {isSelected ? "선택됨" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-title-sm text-grayscale-1000">간편 모드</h2>
          <p className="text-body-md mt-1 text-grayscale-700">
            글자를 키우고 화면을 더 단순하게 보여줘요.
          </p>
          <button
            aria-checked={uxMode === "SENIOR"}
            className={`mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-5 text-left ${
              uxMode === "SENIOR"
                ? "border-espresso bg-yellow-100"
                : "border-grayscale-100 bg-background"
            }`}
            onClick={() => {
              const nextMode: UxMode = uxMode === "SENIOR" ? "STANDARD" : "SENIOR";
              void save({
                fontScale: fontScaleForMode(nextMode, fontScale),
                uxMode: nextMode,
              });
            }}
            role="switch"
            type="button"
          >
            <span className="text-body-lg min-w-0 text-grayscale-1000">
              간편 모드
            </span>
            <span className="text-body-md shrink-0 text-grayscale-800">
              {uxMode === "SENIOR" ? "켜짐" : "꺼짐"}
            </span>
          </button>
        </section>

        {saveError ? (
          <p className="text-body-md text-red" role="alert">
            {saveError}
          </p>
        ) : null}
      </div>
    </SettingsScreenShell>
  );
}
