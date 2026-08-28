/**
 * 위험 수준 배지.
 *
 * <p>백엔드 `RiskAssessmentResponse.level` 은 GREEN / YELLOW / RED 를 보낸다.
 * 색만으로 뜻을 전달하지 않는다 — 색각 이상 사용자와 흑백 캡처에서도 읽혀야 하므로
 * 항상 한글 레이블을 함께 둔다.
 */

export type RiskLevel = "GREEN" | "RED" | "YELLOW";

const FALLBACK: RiskLevel = "GREEN";

const labels: Record<RiskLevel, string> = {
  GREEN: "안정",
  RED: "위험",
  YELLOW: "주의",
};

/**
 * 배경은 옅게, 글자는 진하게 둔다. 채도 높은 면을 크게 쓰면 카드 안에서 배지가
 * 금액보다 먼저 읽혀 시선 순서가 뒤집힌다.
 */
const toneClassNames: Record<RiskLevel, string> = {
  GREEN: "bg-green/10 text-green",
  RED: "bg-red/10 text-red",
  YELLOW: "bg-orange/10 text-orange",
};

export function normalizeRiskLevel(value: string | null | undefined): RiskLevel {
  if (value === "RED" || value === "YELLOW" || value === "GREEN") return value;
  return FALLBACK;
}

export function riskLevelLabel(level: RiskLevel): string {
  return labels[level];
}

export function RiskBadge({
  className = "",
  level,
}: Readonly<{ className?: string; level: RiskLevel }>) {
  return (
    <span
      className={`text-caption inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-medium ${toneClassNames[level]} ${className}`}
    >
      {labels[level]}
    </span>
  );
}
