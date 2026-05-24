"use client";

import { useEffect, useState } from "react";

import { OnboardingSplash } from "@/features/onboarding/components/OnboardingSplash";
import { SPLASH_DURATION_MS } from "@/features/onboarding/constants/splash";
import { SplashGateContext } from "@/shared/layout/SplashGateContext";

type StartupSplashGateProps = Readonly<{
  children: React.ReactNode;
}>;

/**
 * 앱 시작(/) 시 스플래시를 한 번 보여준 뒤 children 을 노출한다.
 * children 은 스플래시와 병렬로 마운트되어 인증 체크 등을 미리 진행할 수 있다.
 * 라우팅 전환은 isSplashComplete 가 true 가 된 뒤에만 수행해야 스플래시가 중간에 끊기지 않는다.
 */
export function StartupSplashGate({ children }: StartupSplashGateProps) {
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsSplashComplete(true);
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <SplashGateContext.Provider value={{ isSplashComplete }}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        {children}
        {!isSplashComplete ? (
          <div className="absolute inset-0 z-50 flex flex-col">
            <OnboardingSplash />
          </div>
        ) : null}
      </div>
    </SplashGateContext.Provider>
  );
}
