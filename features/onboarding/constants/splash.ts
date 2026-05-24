/** 장면 페이드 전환 길이(ms). OnboardingSplash 에서 duration-[600ms] 로 사용한다. */
export const SPLASH_FADE_DURATION_MS = 600;

/** 다이아몬드 인트로(1장면) 표시 시간 */
export const SPLASH_INTRO_DURATION_MS = 1200;

/** "괜찮을까요?" → "알려드릴게요" 장면 표시 시간 */
export const SPLASH_FIRST_TEXT_INTERVAL_MS = 2200;

/** "알려드릴게요" → 로고 전환 전 대기 */
export const SPLASH_PRE_LOGO_INTERVAL_MS = 3000;

/** 로고 장면 표시 시간 */
export const SPLASH_LOGO_HOLD_MS = 2600;

export const SPLASH_STAGE_TIMINGS_MS = [
  SPLASH_INTRO_DURATION_MS,
  SPLASH_INTRO_DURATION_MS + SPLASH_FIRST_TEXT_INTERVAL_MS,
  SPLASH_INTRO_DURATION_MS +
    SPLASH_FIRST_TEXT_INTERVAL_MS +
    SPLASH_PRE_LOGO_INTERVAL_MS,
] as const;

export const SPLASH_DURATION_MS =
  SPLASH_STAGE_TIMINGS_MS[2] + SPLASH_LOGO_HOLD_MS;
