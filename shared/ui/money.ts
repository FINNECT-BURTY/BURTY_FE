/**
 * 금액 표기 규칙.
 *
 * <p>화면마다 제각각 `toLocaleString()` 을 부르면 부호 표기와 반올림이 갈린다.
 * 금융 화면에서 같은 값이 화면마다 다르게 보이는 것은 신뢰를 직접 깎는다.
 */

const KRW = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });

/** 1,234,000원 */
export function formatWon(value: number): string {
  return `${KRW.format(Math.round(value))}원`;
}

/** 부호를 항상 붙인다. 수입·지출 목록처럼 방향이 핵심인 곳에 쓴다. */
export function formatSignedWon(value: number): string {
  const rounded = Math.round(value);
  if (rounded === 0) return "0원";
  const sign = rounded > 0 ? "+" : "-";
  return `${sign}${KRW.format(Math.abs(rounded))}원`;
}

/**
 * 큰 금액을 짧게. 차트 축과 좁은 칸에서만 쓴다.
 *
 * <p>본문 금액에는 쓰지 않는다. 반올림된 값을 정확한 잔액으로 오해하면 안 된다.
 */
export function formatCompactWon(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 100_000_000) {
    return `${sign}${(abs / 100_000_000).toFixed(abs >= 1_000_000_000 ? 0 : 1)}억`;
  }
  if (abs >= 10_000) {
    return `${sign}${(abs / 10_000).toFixed(abs >= 100_000 ? 0 : 1)}만`;
  }
  return `${sign}${KRW.format(abs)}`;
}

/** "3.16" 처럼 월.일 만 남긴다. 목록에서 연도는 소음이다. */
export function formatMonthDay(isoDate: string): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return isoDate;
  return `${parsed.getMonth() + 1}.${parsed.getDate()}`;
}

/** "3월 16일" */
export function formatKoreanDate(isoDate: string): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return isoDate;
  return `${parsed.getMonth() + 1}월 ${parsed.getDate()}일`;
}

/** 알림 목록용 상대 시간. 방금 온 알림과 지난 알림을 한눈에 가르는 것이 목적이다. */
export function formatRelativeTime(isoDateTime: string, now = new Date()): string {
  const parsed = parseIsoDate(isoDateTime);
  if (!parsed) return "";

  const diffMinutes = Math.floor((now.getTime() - parsed.getTime()) / 60_000);
  if (diffMinutes < 1) return "방금";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;

  return formatKoreanDate(isoDateTime);
}

/**
 * 백엔드는 `LocalDate` / `LocalDateTime` 을 타임존 없는 ISO 문자열로 보낸다.
 * `new Date("2026-08-28")` 은 UTC 자정으로 해석되어 KST 에서 하루 밀린다.
 * 날짜만 오는 경우는 로컬 자정으로 직접 만든다.
 */
function parseIsoDate(value: string): Date | null {
  if (!value) return null;

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    );
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
