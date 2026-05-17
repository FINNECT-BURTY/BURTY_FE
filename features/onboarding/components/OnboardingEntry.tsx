"use client";

import Image from "next/image";
import { useState } from "react";

type OnboardingEntryProps = Readonly<{
  onStart: () => void;
}>;

type SocialAuthorizeUrlResponse = Readonly<{
  success: boolean;
  message: string;
  data?: Readonly<{
    authorizeUrl?: string;
    state?: string;
  }>;
  errorCode?: string | null;
}>;

const kakaoButtonClassName =
  "text-title-sm flex h-13 w-full items-center justify-center rounded-2xl bg-[#fee500] px-6 text-grayscale-1000 disabled:opacity-70";
const googleButtonClassName =
  "text-title-sm flex h-13 w-full items-center justify-center gap-3 rounded-2xl bg-background px-6 text-grayscale-1000 shadow-[0_1px_8px_rgba(30,30,30,0.04)]";

function createOAuthState() {
  if (window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function OnboardingEntry({ onStart }: OnboardingEntryProps) {
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true);
    setLoginErrorMessage("");

    try {
      const state = createOAuthState();
      window.sessionStorage.setItem("burty:kakao-oauth-state", state);

      const params = new URLSearchParams({ state });
      const response = await fetch(
        `/api/auth/social/KAKAO/authorize-url?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to create Kakao authorize URL.");
      }

      const result = (await response.json()) as SocialAuthorizeUrlResponse;
      const authorizeUrl = result.data?.authorizeUrl;

      if (!result.success || !authorizeUrl) {
        throw new Error(result.message || "Invalid Kakao authorize URL.");
      }

      window.location.href = authorizeUrl;
    } catch (error) {
      console.error("Kakao login failed:", error);
      setLoginErrorMessage("카카오 로그인을 시작하지 못했어요. 다시 시도해주세요.");
      setIsKakaoLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-background px-10 pb-[max(20px,env(safe-area-inset-bottom))] pt-8 text-grayscale-1000">
      <section className="mt-8 text-center">
        <h1 className="text-display text-grayscale-1000">
          이번 달, 괜찮을까요?
        </h1>
        <p className="text-body-lg mt-1 text-grayscale-800">
          버티가 미리 알려드릴게요
        </p>
      </section>

      <div className="text-body-lg mx-auto mt-6 flex aspect-square w-[200px] items-center justify-center rounded-3xl bg-[#eeeeee] text-grayscale-900">
        로고
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <button
          className={kakaoButtonClassName}
          disabled={isKakaoLoading}
          onClick={handleKakaoLogin}
          type="button"
        >
          {isKakaoLoading ? "카카오 로그인 중..." : "카카오 로그인"}
        </button>
        <button
          className={googleButtonClassName}
          onClick={onStart}
          type="button"
        >
          <Image
            alt=""
            aria-hidden="true"
            height={16}
            src="/icons/onboarding/logo-google.svg"
            width={16}
          />
          Continue with Google
        </button>
        {loginErrorMessage ? (
          <p className="text-caption text-center text-grayscale-700">
            {loginErrorMessage}
          </p>
        ) : null}
      </div>
    </main>
  );
}
