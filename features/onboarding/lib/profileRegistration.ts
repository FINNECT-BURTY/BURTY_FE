type OnboardingProfileResult = Readonly<{
  data?: Readonly<{
    alreadyRegistered?: boolean;
    completed?: boolean;
    profileComplete?: boolean;
    profileCompleted?: boolean;
  }> | null;
  errorCode?: string | null;
  message?: string;
  success?: boolean;
}>;

const PROFILE_ALREADY_EXISTS_MESSAGES = [
  "이미 존재하는 리소스",
  "already registered",
  "already exists",
] as const;

export function isOnboardingProfileAlreadyRegistered(
  response: Response,
  result: OnboardingProfileResult | null,
): boolean {
  if (result?.data?.alreadyRegistered === true) {
    return true;
  }

  if (result?.success === true && result.data?.completed === true) {
    return true;
  }

  const message = result?.message?.toLowerCase() ?? "";
  if (
    PROFILE_ALREADY_EXISTS_MESSAGES.some((fragment) =>
      message.includes(fragment.toLowerCase()),
    )
  ) {
    return true;
  }

  return response.status === 400 && message.includes("이미");
}
