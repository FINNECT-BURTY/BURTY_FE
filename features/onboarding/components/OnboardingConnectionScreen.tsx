import {
  Calendar,
  Lightbulb,
  LockKeyhole,
  type LucideIcon,
  TrendingDown,
} from "lucide-react";

type ConnectionBenefit = Readonly<{
  label: string;
  Icon: LucideIcon;
}>;

const connectionBenefits: readonly ConnectionBenefit[] = [
  { label: "월말 부족을 미리 알려드려요", Icon: Calendar },
  { label: "어디서 돈이 새는지 보여드려요", Icon: TrendingDown },
  { label: "지금 필요한 행동을 알려드려요", Icon: Lightbulb },
];

export function OnboardingConnectionScreen() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col bg-background px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-20 text-grayscale-1000">
      <section className="text-center">
        <h1 className="text-title-lg text-grayscale-1000">
          돈 흐름을 정확히 알려면
          <br />
          연결이 필요해요
        </h1>
        <p className="text-body-md mt-4 text-grayscale-900">
          버티는 월말 위험을 미리 알려드려요
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-3">
        {connectionBenefits.map(({ label, Icon }) => (
          <div
            className="flex h-20 items-center gap-4 rounded-xl border border-grayscale-200 bg-background px-4"
            key={label}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-grayscale-100 text-grayscale-1000">
              <Icon aria-hidden="true" size={21} strokeWidth={2} />
            </span>
            <p className="text-body-md text-grayscale-1000">{label}</p>
          </div>
        ))}
      </section>

      <div className="text-caption mx-auto mt-8 flex h-8 items-center justify-center gap-1.5 rounded-full bg-grayscale-100 px-4 text-grayscale-900">
        <LockKeyhole
          aria-hidden="true"
          className="text-grayscale-1000"
          size={14}
          strokeWidth={2.5}
        />
        은행 수준으로 안전하게 보호됩니다
      </div>

      <footer className="mt-auto text-center">
        <button
          className="text-title-sm flex h-12 w-full items-center justify-center rounded-xl bg-grayscale-1000 text-background"
          type="button"
        >
          연결하기
        </button>
        <button
          className="text-caption mt-5 text-grayscale-900"
          type="button"
        >
          나중에 할게요
        </button>
      </footer>
    </main>
  );
}
