"use client";

import { useEffect, useState } from "react";

const SPLASH_STAGE_TIMINGS_MS = [600, 1900, 3200] as const;
const SPLASH_SCENES = [
  {
    label: "스플래시 시작",
    src: "/icons/onboarding/splash-1.svg",
  },
  {
    label: "이번 달, 괜찮을까요?",
    src: "/icons/onboarding/splash-2.svg",
  },
  {
    label: "이번 달, 괜찮을까요? 버티가 미리 알려드릴게요",
    src: "/icons/onboarding/splash-3.svg",
  },
  {
    label: "Burty",
    src: "/icons/onboarding/splash-4.svg",
  },
] as const;

type SplashStage = 0 | 1 | 2 | 3;

function getSceneClassName(active: boolean) {
  return `absolute inset-0 transition-opacity duration-[600ms] animate-splash-fade ${
    active ? "opacity-100" : "opacity-0"
  }`;
}

export function OnboardingSplash() {
  const [stage, setStage] = useState<SplashStage>(0);

  useEffect(() => {
    const timers = SPLASH_STAGE_TIMINGS_MS.map((delay, index) =>
      window.setTimeout(() => {
        setStage((index + 1) as SplashStage);
      }, delay),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <section
      aria-label={SPLASH_SCENES[stage].label}
      className="relative flex min-h-dvh flex-1 overflow-hidden bg-yellow-100"
    >
      {SPLASH_SCENES.map((scene, index) => (
        <div
          key={scene.src}
          aria-hidden="true"
          className={`${getSceneClassName(stage === index)} bg-cover bg-center bg-no-repeat`}
          style={{ backgroundImage: `url(${scene.src})` }}
        />
      ))}
    </section>
  );
}
