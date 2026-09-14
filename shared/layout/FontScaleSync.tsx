"use client";

import { useEffect } from "react";

import { applyFontScale, readStoredFontScale } from "@/features/mypage/api/display";

/**
 * 저장해 둔 글자 배율을 첫 그리기부터 적용한다.
 *
 * <p>서버 응답을 기다렸다 적용하면 화면이 기본 크기로 한 번 그려졌다가 커진다. 글자 크기를
 * 키워 둔 사용자에게는 그 깜빡임이 매번 보인다.
 *
 * <p>화면을 그리지 않는다. 배율만 세우고 빠진다.
 */
export function FontScaleSync() {
  useEffect(() => {
    applyFontScale(readStoredFontScale());
  }, []);

  return null;
}
