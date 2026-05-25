export const ONBOARDING_AGREEMENT_PATH =
  "/onboarding?step=agreement&newUser=true";

type PostAuthSource = "email" | "social";

type ResolvePostAuthDestinationInput = Readonly<{
  authSource?: PostAuthSource;
  newUser?: boolean;
  profileComplete?: boolean;
}>;

/**
 * 로그인/소셜 콜백 직후 이동 경로.
 *
 * - 이메일: BE login 이 newUser=false 를 내려도 profileComplete 로 온보딩 여부를 판단한다.
 * - 소셜: BE 가 기존 회원에게 profileComplete=false 를 주는 오탐이 있어
 *   newUser=false 이면 profileComplete 와 무관하게 홈으로 보낸다.
 */
export function resolvePostAuthDestination({
  authSource = "social",
  newUser,
  profileComplete,
}: ResolvePostAuthDestinationInput): string {
  if (profileComplete === true) {
    return "/";
  }

  if (authSource === "social" && newUser === false) {
    return "/";
  }

  return ONBOARDING_AGREEMENT_PATH;
}
