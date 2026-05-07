import { Apple, MessageSquare } from "lucide-react";

export function OnboardingEntry() {
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

      <div className="mx-auto mt-6 flex aspect-square w-[200px] items-center justify-center rounded-2xl border border-[#c8caca] bg-logo-placeholder text-base font-medium text-sub-foreground">
        로고
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <button className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-background">
          시작하기
        </button>
        <button className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#c8caca] bg-background px-6 text-sm font-medium text-foreground transition-colors active:bg-sub-background">
          <MessageSquare aria-hidden="true" size={16} strokeWidth={1.5} />
          카카오로 계속하기
        </button>
        <button className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#c8caca] bg-background px-6 text-sm font-medium text-foreground transition-colors active:bg-sub-background">
          <Apple
            aria-hidden="true"
            size={16}
            fill="currentColor"
            strokeWidth={2}
          />
          Apple로 계속하기
        </button>
      </div>
      <p className="mt-2 text-center text-[12px] font-medium text-sub-foreground">
        이미 계정이 있어요? 로그인
      </p>

      <footer className="mt-auto pt-6 text-center">
        <div className="flex items-center justify-center gap-5 text-xs font-medium text-sub-foreground">
          <a href="#privacy">개인정보 처리방침</a>
          <span className="h-4 w-px bg-[#c8caca]" />
          <a href="#terms">이용약관</a>
        </div>
        <p className="mt-3 text-[9px] font-medium tracking-[0.08em] text-[#9a9d9d]">
          © 2026 BERTY, KNOWLEDGEABLE YET APPROACHABLE.
        </p>
      </footer>
    </main>
  );
}
