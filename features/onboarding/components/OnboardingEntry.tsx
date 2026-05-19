"use client";

import Image from "next/image";

import {
  socialProviderConfigs,
  socialProviders,
} from "@/features/onboarding/constants/socialProviders";
import { useSocialLogin } from "@/features/onboarding/hooks/useSocialLogin";

export function OnboardingEntry() {
  const { loadingProvider, loginErrorMessage, startSocialLogin } =
    useSocialLogin();

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
        {socialProviders.map((provider) => {
          const providerConfig = socialProviderConfigs[provider];
          return (
            <button
              className={providerConfig.buttonClassName}
              disabled={loadingProvider !== null}
              key={provider}
              onClick={() => startSocialLogin(provider)}
              type="button"
            >
              <Image
                alt=""
                aria-hidden="true"
                height={16}
                src={providerConfig.iconSrc}
                width={16}
              />
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
