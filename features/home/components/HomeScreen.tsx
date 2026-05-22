import { BottomNavigation } from "@/shared/layout/BottomNavigation";
import { MainHeader } from "@/shared/layout/MainHeader";
import { BottomActionButton } from "@/shared/ui/BottomActionButton";

type RiskLevel = "danger" | "safe" | "warning";

const riskLevelLabels: Record<RiskLevel, string> = {
  danger: "위험",
  safe: "안정",
  warning: "주의",
};

const riskLevelClassNames: Record<RiskLevel, string> = {
  danger: "bg-red",
  safe: "bg-green",
  warning: "bg-orange",
};

const homeSummary = {
  userName: "00",
  savingRate: 12,
  spendableAmount: 55000,
  monthlyLimit: 132400,
  totalAsset: 233234,
  expectedBalance: 132400,
  shortageDate: 25,
  shortageAmount: 120000,
  riskLevel: "warning" satisfies RiskLevel,
} as const;

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function HomeScreen() {
  const spendableRatio = Math.min(
    Math.max(homeSummary.spendableAmount / homeSummary.monthlyLimit, 0),
    1,
  );
  const progressWidth = `${spendableRatio * 100}%`;
  const riskLevel = homeSummary.riskLevel;

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-main-background text-grayscale-1000">
      <MainHeader />

      <section className="min-h-0 flex-1 overflow-y-auto px-6 pb-7 pt-2">
        <section className="flex min-h-[360px] flex-col bg-background px-5 py-5 rounded-2xl shadow-1">
          <div>
            <h1 className="text-title-lg text-grayscale-1000">
              안녕하세요 {homeSummary.userName}님!
            </h1>
            <p className="text-body-md mt-1 text-grayscale-900">
              어제보다 {homeSummary.savingRate}% 절약 중이에요
            </p>
          </div>

          <div className="mt-auto">
            <p className="text-body-md text-grayscale-800">
              오늘 소비 가능 금액
            </p>
            <p className="text-title-md mt-1 text-grayscale-1000">
              {formatWon(homeSummary.spendableAmount)} /{" "}
              {formatWon(homeSummary.monthlyLimit)}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-grayscale-100">
              <div
                aria-hidden="true"
                className="h-full rounded-full bg-gradient-to-r from-yellow-200 to-yellow-400"
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        </section>

        <section className="mt-4 flex min-h-20 items-center justify-between bg-background px-5 rounded-2xl border border-grayscale-100">
          <h2 className="text-title-sm text-grayscale-1000">
            {homeSummary.userName}님의 총 자산
          </h2>
          <p className="text-title-sm text-grayscale-900">
            {formatWon(homeSummary.totalAsset)}
          </p>
        </section>

        <section className="mt-4 bg-background px-5 py-5 rounded-2xl border border-grayscale-100">
          <div className="flex items-center justify-between">
            <h2 className="text-title-sm text-grayscale-1000">
              이번 달 예상 상태
            </h2>
            <span
              className={`text-body-md rounded-full px-3 py-1 text-background ${riskLevelClassNames[riskLevel]}`}
            >
              {riskLevelLabels[riskLevel]}
            </span>
          </div>
          <div aria-hidden="true" className="mt-4 h-px bg-grayscale-100" />
          {/* <div className="mt-8">
            <p className="text-body-md text-grayscale-800">
              월말 예상 잔액
            </p>
            <p className="text-body-lg mt-1 text-grayscale-1000">
              {formatWon(homeSummary.expectedBalance)}
            </p>
          </div> */}

          <div className="mt-4">
            <p className="text-body-md text-grayscale-800">
              예상 위험이 있어요
            </p>
            <p className="text-body-lg mt-1 text-grayscale-1000">
              {homeSummary.shortageDate}일에{" "}
              {formatWon(homeSummary.shortageAmount)} 부족할 예정이에요
            </p>
          </div>
          {/* TODO: onClick 달기 */}
          <BottomActionButton
              className="mt-6"
              textStyle="title-sm"
            >
              지금 해결하기
            </BottomActionButton>
        </section>
      </section>
      <BottomNavigation />
    </main>
  );
}
