import Link from "next/link";
import { Apple, MessageSquare } from "lucide-react";

type OnboardingEntryProps = Readonly<{
  onStart: () => void;
}>;

const primaryButtonClassName =
  "flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-background";
const socialButtonClassName =
  "flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors active:bg-sub-background";

export function OnboardingEntry({ onStart }: OnboardingEntryProps) {
  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-background px-10 pb-[max(20px,env(safe-area-inset-bottom))] pt-8 text-foreground">
      <section className="mt-8 text-center">
        <h1 className="text-2xl font-semibold leading-8 text-primary">
          이번 달, 괜찮을까요?
        </h1>
        <p className="mt-1 text-base font-medium text-sub-foreground">
          버티가 미리 알려드릴게요
        </p>
      </section>

      <div className="mx-auto mt-6 flex aspect-square w-[200px] items-center justify-center rounded-2xl border border-border bg-logo-placeholder text-base font-medium text-sub-foreground">
        로고
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <button
          className={primaryButtonClassName}
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
        className="mt-2 text-center text-xs font-medium text-sub-foreground"
      >
        이미 계정이 있어요? 로그인
      </Link>

      <footer className="mt-auto pt-6 text-center">
        <div className="flex items-center justify-center gap-5 text-xs font-medium text-sub-foreground">
          <Link href="/privacy">개인정보 처리방침</Link>
          <span className="h-4 w-px bg-border" />
          <Link href="/terms">이용약관</Link>
        </div>
        <p className="mt-3 text-[9px] font-medium tracking-[0.08em] text-muted-foreground">
          © 2026 BERTY, KNOWLEDGEABLE YET APPROACHABLE.
        </p>
      </footer>
    </main>
  );
}
