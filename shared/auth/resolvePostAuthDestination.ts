export const ONBOARDING_AGREEMENT_PATH =
  "/onboarding?step=agreement&newUser=true";

type ResolvePostAuthDestinationInput = Readonly<{
  newUser?: boolean;
  profileComplete?: boolean;
}>;

/**
 * 로그인/소셜 콜백 직후 이동 경로.
 * profileComplete 가 true 면 기존 가입 유저로 보고 항상 홈으로 보낸다.
 */
export function resolvePostAuthDestination({
  newUser,
  profileComplete,
}: ResolvePostAuthDestinationInput): string {
  if (profileComplete === true) {
    return "/";
  }

  if (profileComplete === false || newUser === true) {
    return ONBOARDING_AGREEMENT_PATH;
  }

  // newUser=false 면 기존 회원. profileComplete 미전달이어도 홈으로 보낸다.
  if (newUser === false) {
    return "/";
  }

  return ONBOARDING_AGREEMENT_PATH;
}
