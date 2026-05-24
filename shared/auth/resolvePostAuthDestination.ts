export const ONBOARDING_AGREEMENT_PATH =
  "/onboarding?step=agreement&newUser=true";

type ResolvePostAuthDestinationInput = Readonly<{
  newUser?: boolean;
  profileComplete?: boolean;
}>;

/**
 * 로그인/소셜 콜백 직후 이동 경로.
 *
 * BE 는 기존 회원에게도 profileComplete=false 를 내려주는 경우가 있다.
 * newUser=false 이면 기존 회원으로 보고 profileComplete 값과 무관하게 홈으로 보낸다.
 */
export function resolvePostAuthDestination({
  newUser,
  profileComplete,
}: ResolvePostAuthDestinationInput): string {
  if (profileComplete === true || newUser === false) {
    return "/";
  }

  if (newUser === true || profileComplete === false) {
    return ONBOARDING_AGREEMENT_PATH;
  }

  return ONBOARDING_AGREEMENT_PATH;
}
