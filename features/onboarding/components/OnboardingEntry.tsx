"use client";

import Image from "next/image";
import { useState } from "react";

type SocialAuthorizeUrlResponse = Readonly<{
  success: boolean;
  message: string;
  data?: Readonly<{
    authorizeUrl?: string;
    state?: string;
  }>;
  errorCode?: string | null;
}>;

type SocialProvider = "kakao" | "google" | "naver";

type SocialProviderConfig = Readonly<{
  label: string;
  iconSrc?: string;
  buttonClassName: string;
}>;

const kakaoButtonClassName =
  "text-title-sm flex h-13 w-full items-center justify-center gap-3 rounded-2xl bg-[#fee500] px-6 text-grayscale-1000 disabled:opacity-70";
const googleButtonClassName =
  "text-title-sm flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-grayscale-200 bg-background px-6 text-grayscale-1000 shadow-[0_1px_8px_rgba(30,30,30,0.04)] disabled:opacity-70";
const naverButtonClassName =
  "text-title-sm flex h-13 w-full items-center justify-center gap-3 rounded-2xl bg-[#03c75a] px-6 text-white disabled:opacity-70";

const SOCIAL_PROVIDERS: Record<SocialProvider, SocialProviderConfig> = {
  kakao: {
    label: "카카오 로그인",
    iconSrc: "/icons/onboarding/logo-kakao.svg",
    buttonClassName: kakaoButtonClassName,
  },
  google: {
    label: "Continue with Google",
    iconSrc: "/icons/onboarding/logo-google.svg",
    buttonClassName: googleButtonClassName,
  },
  naver: {
    label: "네이버 로그인",
    iconSrc: "/icons/onboarding/logo-naver.svg",
    buttonClassName: naverButtonClassName,
  },
};

function createOAuthState() {
  if (window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * BFF 소셜 로그인: FE → Next proxy(authorize-url) → Provider → BE callback → 쿠키 set → FE /auth/callback.
 */
export function OnboardingEntry() {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(
    null,
  );
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  const handleSocialLogin = async (provider: SocialProvider) => {
    const providerConfig = SOCIAL_PROVIDERS[provider];
    setLoadingProvider(provider);
    setLoginErrorMessage("");

    try {
      const state = createOAuthState();
      const params = new URLSearchParams({ state });
      const response = await fetch(
        `/api/auth/${provider}/authorize-url?${params.toString()}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error(`Failed to create ${provider} authorize URL.`);
      }

      const result = (await response.json()) as SocialAuthorizeUrlResponse;
      const authorizeUrl = result.data?.authorizeUrl;

      if (!result.success || !authorizeUrl) {
        throw new Error(result.message || "소셜 로그인 URL을 받지 못했습니다.");
      }

      window.location.assign(authorizeUrl);
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      setLoginErrorMessage(
        `${providerConfig.label}을 시작하지 못했어요. 다시 시도해주세요.`,
      );
      setLoadingProvider(null);
    }
  };

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-background px-10 pb-[max(20px,env(safe-area-inset-bottom))] pt-8 text-grayscale-1000">
      <div aria-hidden="true" className="h-16 shrink-0" />

      <div className="text-body-lg mx-auto mt-10 flex aspect-square w-[200px] items-center justify-center rounded-3xl bg-[#eeeeee] text-grayscale-900">
        로고
      </div>

      <section className="mt-4 text-center">
        <h1 className="text-display text-grayscale-1000">
          이번 달, 괜찮을까요?
        </h1>
        <p className="text-body-lg mt-1 text-grayscale-800">
          버티가 미리 알려드릴게요
        </p>
      </section>

      <div className="mt-10 flex flex-col gap-3">
        {(["kakao", "google", "naver"] as const).map((provider) => {
          const providerConfig = SOCIAL_PROVIDERS[provider];
          return (
            <button
              className={providerConfig.buttonClassName}
              disabled={loadingProvider !== null}
              key={provider}
              onClick={() => handleSocialLogin(provider)}
              type="button"
            >
              {providerConfig.iconSrc ? (
                <Image
                  alt=""
                  aria-hidden="true"
                  height={16}
                  src={providerConfig.iconSrc}
                  width={16}
                />
              ) : null}
              {providerConfig.label}
            </button>
          );
        })}
        {loginErrorMessage ? (
          <p className="text-caption text-center text-grayscale-700">
            {loginErrorMessage}
          </p>
        ) : null}
      </div>
    </main>
  );
}
