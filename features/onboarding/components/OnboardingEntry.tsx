import Image from "next/image";

type OnboardingEntryProps = Readonly<{
  onStart: () => void;
}>;

const naverButtonClassName =
  "text-title-sm flex h-13 w-full items-center justify-center gap-3 rounded-2xl bg-[#03c75a] px-6 text-[#FFFFFF]";
const googleButtonClassName =
  "text-title-sm flex h-13 w-full items-center justify-center gap-3 rounded-2xl bg-background px-6 text-grayscale-1000 shadow-[0_1px_8px_rgba(30,30,30,0.04)]";

export function OnboardingEntry({ onStart }: OnboardingEntryProps) {
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
          className={naverButtonClassName}
          onClick={onStart}
          type="button"
        >
          <Image
            alt=""
            aria-hidden="true"
            height={16}
            src="/icons/onboarding/logo-naver.svg"
            width={16}
          />
          네이버 로그인
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
      </div>
    </main>
  );
}
