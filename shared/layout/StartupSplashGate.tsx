"use client";

import { useEffect, useState } from "react";

import { OnboardingSplash } from "@/features/onboarding/components/OnboardingSplash";
import { SPLASH_DURATION_MS } from "@/features/onboarding/constants/splash";
import { SplashGateContext } from "@/shared/layout/SplashGateContext";
import {
  markStartupSplashFinished,
  shouldShowStartupSplash,
} from "@/shared/layout/startupSplash";

type StartupSplashGateProps = Readonly<{
  children: React.ReactNode;
}>;

type SplashState = Readonly<{
  isSplashComplete: boolean;
  showSplash: boolean;
}>;

function resolveInitialSplashState(): SplashState {
  const showSplash = shouldShowStartupSplash();
  return {
    isSplashComplete: !showSplash,
    showSplash,
  };
}

/**
 * `/` 첫 접속·새로고침 시에만 스플래시를 보여준다.
 * 로그인 후 홈 이동, 하단 탭 전환 등에서는 스플래시를 띄우지 않는다.
 */
export function StartupSplashGate({ children }: StartupSplashGateProps) {
  const [{ isSplashComplete, showSplash }, setSplashState] = useState(
    resolveInitialSplashState,
  );

  useEffect(() => {
    if (!showSplash) return;

    const timer = window.setTimeout(() => {
      markStartupSplashFinished();
      setSplashState({ isSplashComplete: true, showSplash: false });
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [showSplash]);

  return (
    <SplashGateContext.Provider value={{ isSplashComplete }}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        {children}
        {showSplash ? (
          <div className="absolute inset-0 z-50">
            <OnboardingSplash />
          </div>
        ) : null}
      </div>
    </SplashGateContext.Provider>
  );
}
