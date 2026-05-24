"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SPLASH_STAGE_TIMINGS_MS = [1200, 3800, 6400] as const;
const SPLASH_TEXT_TOP_CLASS_NAME = "top-[41.25%]";
const SPLASH_LOGO_TOP_CLASS_NAME = "top-[39.8%]";
const SPLASH_SCENES = [
  {
    label: "스플래시 시작",
    src: "/icons/onboarding/splash-1.svg",
  },
  {
    label: "이번 달, 괜찮을까요?",
    src: "/icons/onboarding/splash-2.svg",
    title: "이번 달, 괜찮을까요?",
  },
  {
    label: "이번 달, 괜찮을까요? 버티가 미리 알려드릴게요",
    src: "/icons/onboarding/splash-3.svg",
    title: "이번 달, 괜찮을까요?\n버티가 미리 알려드릴게요",
  },
  {
    label: "Burty",
    src: "/icons/onboarding/splash-4.svg",
    logoSrc: "/icons/onboarding/splash-logo.svg",
  },
] as const;

type SplashStage = 0 | 1 | 2 | 3;

function getSceneClassName(active: boolean) {
  return `absolute inset-0 transition-opacity duration-[600ms] ${
    active ? "opacity-100" : "opacity-0"
  }`;
}

function getContentClassName(active: boolean) {
  return `absolute inset-0 z-10 transition-opacity duration-[600ms] ${
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
      <div className="absolute left-1/2 top-1/2 aspect-[360/640] h-full max-h-[calc(100vw*640/360)] w-full max-w-[calc(100dvh*360/640)] -translate-x-1/2 -translate-y-1/2 overflow-hidden">
        {SPLASH_SCENES.map((scene, index) => (
          <div
            key={scene.src}
            aria-hidden="true"
            className={`${getSceneClassName(stage === index)} bg-cover bg-center bg-no-repeat`}
            style={{ backgroundImage: `url(${scene.src})` }}
          />
        ))}

        {SPLASH_SCENES.map((scene, index) => {
          const active = stage === index;

          if ("title" in scene) {
            return (
              <div
                aria-hidden={!active}
                className={getContentClassName(active)}
                key={`${scene.src}-title`}
            >
                <p
                  className={`text-title-lg absolute left-0 right-0 ${SPLASH_TEXT_TOP_CLASS_NAME} whitespace-pre-line px-6 text-center text-grayscale-1000`}
                >
                  {scene.title}
                </p>
              </div>
            );
          }

          if ("logoSrc" in scene) {
            return (
            <div
              aria-hidden={!active}
              className={getContentClassName(active)}
              key={`${scene.src}-logo`}
            >
              <Image
                alt=""
                aria-hidden="true"
                className={`absolute left-1/2 ${SPLASH_LOGO_TOP_CLASS_NAME} h-auto w-[188px] -translate-x-1/2`}
                height={73}
                priority
                src={scene.logoSrc}
                  width={188}
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    </section>
  );
}
