import Link from "next/link";
import { Apple, MessageSquare } from "lucide-react";

type OnboardingEntryProps = Readonly<{
  onStart: () => void;
}>;

const mainButtonClassName =
  "text-body-md flex h-11 w-full items-center justify-center rounded-lg bg-grayscale-1000 px-6 text-background";
const socialButtonClassName =
  "text-body-md flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-grayscale-200 bg-background px-6 text-grayscale-1000 transition-colors active:bg-grayscale-100";

export function OnboardingEntry({ onStart }: OnboardingEntryProps) {
  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-background px-10 pb-[max(20px,env(safe-area-inset-bottom))] pt-8 text-grayscale-1000">
      <section className="mt-8 text-center">
        <h1 className="text-display text-grayscale-1000">
          이번 달, 괜찮을까요?
        </h1>
        <p className="text-body-lg mt-1 text-grayscale-900">
          버티가 미리 알려드릴게요
        </p>
      </section>

      <div className="text-body-lg mx-auto mt-6 flex aspect-square w-[200px] items-center justify-center rounded-2xl border border-grayscale-200 bg-grayscale-200 text-grayscale-900">
        로고
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <button
          className={mainButtonClassName}
          onClick={onStart}
          type="button"
        >
          시작하기
        </button>
        <button className={socialButtonClassName} type="button">
          <MessageSquare aria-hidden="true" size={16} strokeWidth={1.5} />
          카카오로 계속하기
        </button>
        <button className={socialButtonClassName} type="button">
          <Apple
            aria-hidden="true"
            size={16}
            fill="currentColor"
            strokeWidth={2}
          />
          Apple로 계속하기
        </button>
      </div>
      {/* TODO: 로그인, 개인정보 처리방침, 이용약관 페이지 추가 */}
      <Link
        href="/login"
        className="text-caption mt-2 text-center text-grayscale-900"
      >
        이미 계정이 있어요? 로그인
      </Link>

      <footer className="mt-auto pt-6 text-center">
        <div className="text-caption flex items-center justify-center gap-5 text-grayscale-900">
          <Link href="/privacy">개인정보 처리방침</Link>
          <span className="h-4 w-px bg-grayscale-200" />
          <Link href="/terms">이용약관</Link>
        </div>
        <p className="mt-3 text-[9px] font-medium tracking-normal text-grayscale-700">
          © 2026 BERTY, KNOWLEDGEABLE YET APPROACHABLE.
        </p>
      </footer>
    </main>
  );
}
