import { describe, expect, it } from "vitest";

import {
  clampFontScale,
  fontScaleForMode,
  fontScaleOptions,
  MAX_FONT_SCALE,
  MIN_FONT_SCALE,
} from "@/features/mypage/api/display";

/**
 * 글자 배율.
 *
 * <p>잘못된 값이 들어가면 화면 전체가 읽을 수 없게 되고, 설정 화면 자체도 조작할 수 없다.
 * 그래서 받은 값을 그대로 쓰지 않는다.
 */
describe("clampFontScale", () => {
  it("범위를 벗어난 값을 잘라낸다", () => {
    expect(clampFontScale(0.1)).toBe(MIN_FONT_SCALE);
    expect(clampFontScale(9)).toBe(MAX_FONT_SCALE);
  });

  it("숫자가 아니면 기본 배율로 돌린다", () => {
    // 저장된 값이 손상되거나 서버가 null 을 줄 수 있다.
    expect(clampFontScale("어쩌다 들어간 문자열")).toBe(MIN_FONT_SCALE);
    expect(clampFontScale(null)).toBe(MIN_FONT_SCALE);
    expect(clampFontScale(undefined)).toBe(MIN_FONT_SCALE);
    expect(clampFontScale(Number.NaN)).toBe(MIN_FONT_SCALE);
  });

  it("문자열 숫자는 숫자로 읽는다", () => {
    // localStorage 는 문자열만 돌려주고, 백엔드의 BigDecimal 도 문자열로 올 수 있다.
    expect(clampFontScale("1.2")).toBe(1.2);
  });

  it("고를 수 있는 값은 모두 허용 범위 안에 있다", () => {
    for (const option of fontScaleOptions) {
      expect(clampFontScale(option.value)).toBe(option.value);
    }
  });
});

describe("fontScaleForMode", () => {
  it("시니어 모드를 켜면 글자를 함께 키운다", () => {
    // 모드만 바뀌고 크기가 그대로면 사용자 입장에서는 아무 일도 일어나지 않은 것과 같다.
    expect(fontScaleForMode("SENIOR", 1)).toBe(1.2);
  });

  it("이미 더 크게 맞춰 둔 값은 줄이지 않는다", () => {
    expect(fontScaleForMode("SENIOR", 1.4)).toBe(1.4);
  });

  it("일반 모드로 돌아가도 고른 크기는 유지한다", () => {
    // 글자 크기는 시니어 모드와 별개로 고르는 값이다. 모드를 끄면서 임의로 되돌리면
    // 사용자가 맞춰 둔 설정이 사라진다.
    expect(fontScaleForMode("STANDARD", 1.4)).toBe(1.4);
  });
});
