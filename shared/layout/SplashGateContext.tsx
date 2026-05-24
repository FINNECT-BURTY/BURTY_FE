"use client";

import { createContext, useContext } from "react";

type SplashGateContextValue = Readonly<{
  isSplashComplete: boolean;
}>;

const SplashGateContext = createContext<SplashGateContextValue>({
  // StartupSplashGate 밖(예: /onboarding)에서는 스플래시 대기 없이 즉시 동작한다.
  isSplashComplete: true,
});

export function useSplashGate() {
  return useContext(SplashGateContext);
}

export { SplashGateContext };
