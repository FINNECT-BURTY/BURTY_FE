import type { BudgetTone } from "@/features/budget/api/budgets";

const fillClassNames: Record<BudgetTone, string> = {
  danger: "bg-red",
  normal: "bg-yellow-400",
  warning: "bg-orange",
};

/**
 * 예산 사용률 막대.
 *
 * <p>색만으로 위험을 알리지 않는다. 사용률 숫자를 함께 두고, 스크린리더에는
 * progressbar 로 값을 준다. 색 구분이 어려운 사용자에게 막대는 길이만 남는다.
 */
export function BudgetBar({
  tone,
  usagePercent,
}: Readonly<{ tone: BudgetTone; usagePercent: number }>) {
  // 200% 를 쓴 달에도 막대는 꽉 찬 상태까지만 그린다. 넘치면 레이아웃이 깨진다.
  const width = Math.min(Math.max(usagePercent, 0), 100);

  return (
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.max(usagePercent, 0)}
      className="mt-3 h-2 w-full overflow-hidden rounded-full bg-grayscale-100"
      role="progressbar"
    >
      <div
        className={`h-full rounded-full ${fillClassNames[tone]}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
