"use client";

import { useEffect, useState } from "react";

const SPLASH_STAGES = [
  {
    content: (
      <>
        이번 달, 괜찮을까요?
        <br />
        버티가 미리 알려드릴게요
      </>
    ),
    className: "text-title-lg font-bold",
  },
  {
    content: "Burty",
    className: "text-[34px] font-normal leading-[1.4]",
  },
  {
    content: "이번 달, 괜찮을까요?",
    className: "text-title-lg font-bold",
  },
] as const;

export function OnboardingSplash() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = SPLASH_STAGES.slice(1).map((_, index) =>
      window.setTimeout(() => {
        setStage(index + 1);
      }, (index + 1) * 1000),
    );

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, []);

  const currentStage = SPLASH_STAGES[stage];

  return (
    <section className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-[linear-gradient(180deg,#fffdf4_0%,#fff7c9_52%,#fcfcfc_100%)] px-8 text-center">
      <p
        className={`animate-splash-fade text-grayscale-1000 ${currentStage.className}`}
        key={stage}
      >
        {currentStage.content}
      </p>
    </section>
  );
}
