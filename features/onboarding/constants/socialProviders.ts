export type SocialProvider = "kakao" | "google";

type SocialProviderConfig = Readonly<{
  label: string;
  iconSrc: string;
  iconBackgroundClassName: string;
}>;

export const socialProviders: readonly SocialProvider[] = ["kakao", "google"];

export const socialProviderConfigs: Record<
  SocialProvider,
  SocialProviderConfig
> = {
  kakao: {
    label: "카카오로\n시작하기",
    iconSrc: "/icons/onboarding/logo-kakao.svg",
    iconBackgroundClassName: "bg-background border border-grayscale-200",
  },
  google: {
    label: "구글로\n시작하기",
    iconSrc: "/icons/onboarding/logo-google.svg",
    iconBackgroundClassName: "bg-background border border-grayscale-200",
  },
};
