export type SocialProvider = "kakao" | "google" | "naver";

type SocialProviderConfig = Readonly<{
  label: string;
  iconSrc: string;
  buttonClassName: string;
}>;

const kakaoButtonClassName =
  "text-title-sm flex h-13 w-full items-center justify-center gap-3 rounded-2xl bg-[#fee500] px-6 text-grayscale-1000 disabled:opacity-70";
const googleButtonClassName =
  "text-title-sm flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-grayscale-200 bg-background px-6 text-grayscale-1000 shadow-[0_1px_8px_rgba(30,30,30,0.04)] disabled:opacity-70";
const naverButtonClassName =
  "text-title-sm flex h-13 w-full items-center justify-center gap-3 rounded-2xl bg-[#03c75a] px-6 text-white disabled:opacity-70";

export const socialProviders: readonly SocialProvider[] = [
  "kakao",
  "google",
  "naver",
];

export const socialProviderConfigs: Record<
  SocialProvider,
  SocialProviderConfig
> = {
  google: {
    buttonClassName: googleButtonClassName,
    iconSrc: "/icons/onboarding/logo-google.svg",
    label: "Continue with Google",
  },
  kakao: {
    buttonClassName: kakaoButtonClassName,
    iconSrc: "/icons/onboarding/logo-kakao.svg",
    label: "카카오 로그인",
  },
  naver: {
    buttonClassName: naverButtonClassName,
    iconSrc: "/icons/onboarding/logo-naver.svg",
    label: "네이버 로그인",
  },
};
