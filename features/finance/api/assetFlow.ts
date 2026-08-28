import type {
  CashflowForecast,
  DailyBalancePoint,
} from "@/features/home/api/homeOverview";
import { fetchApiData, fetchApiList } from "@/shared/api/apiResponse";

/** `GET /api/v1/cashflow-management/schedules` — 백엔드 `CashflowScheduleResponse`. */
export type CashflowSchedule = Readonly<{
  scheduleId: string;
  scheduleTypeCode?: string;
  label: string;
  amount: number;
  /** IN | OUT */
  direction: string;
  dayOfMonth: number;
  active: boolean;
}>;

export type ScheduleDirection = "in" | "out";

export type AssetFlowData = Readonly<{
  forecast: CashflowForecast | null;
  schedules: readonly CashflowSchedule[];
}>;

export async function fetchAssetFlow(): Promise<AssetFlowData> {
  const [forecast, schedules] = await Promise.all([
    fetchApiData<CashflowForecast>("/api/v1/cashflow/forecast").catch(
      () => null,
    ),
    fetchApiList<CashflowSchedule>(
      "/api/v1/cashflow-management/schedules",
    ).catch(() => [] as readonly CashflowSchedule[]),
  ]);

  return { forecast, schedules };
}

export function scheduleDirection(schedule: CashflowSchedule): ScheduleDirection {
  return schedule.direction?.toUpperCase() === "IN" ? "in" : "out";
}

/**
 * 목록 표시용 부호 있는 금액.
 *
 * <p>백엔드 `amount` 는 부호 없는 크기다. 방향은 `direction` 에 따로 있으므로
 * 화면에서 합칠 때 부호를 붙인다.
 */
export function signedScheduleAmount(schedule: CashflowSchedule): number {
  const magnitude = Math.abs(schedule.amount);
  return scheduleDirection(schedule) === "in" ? magnitude : -magnitude;
}

/**
 * 이번 달 기준으로 일정의 실제 날짜를 만든다.
 *
 * <p>`dayOfMonth` 가 그 달에 없는 경우(2월 31일)에는 말일로 당긴다. 그대로 `new Date`
 * 에 넘기면 다음 달로 넘어가 일정 순서가 뒤집힌다.
 */
export function scheduleDateInMonth(
  dayOfMonth: number,
  reference = new Date(),
): Date {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(Math.max(dayOfMonth, 1), lastDay));
}

/**
 * 예측 잔액 시계열을 차트가 쓰는 형태로 바꾼다.
 *
 * <p>차트는 금액 단위를 그대로 그린다. 예전에는 0~56 범위의 정체불명 값이 하드코딩돼
 * 있어 세로축이 실제 잔액과 무관했다.
 */
export type AssetFlowPoint = Readonly<{
  balance: number;
  date: string;
  /**
   * 시계열에서의 위치(1부터).
   *
   * <p>예전에는 날짜의 "일" 을 썼다. 예측은 오늘부터 30일을 보므로 월 경계를 넘는 일이
   * 흔하고, 그러면 8월 30일과 9월 30일이 같은 값이 되어 구간 확대가 엉뚱한 날을 잡았다.
   */
  index: number;
  /** 축 라벨. 월이 바뀌는 지점을 구분할 수 있어야 한다. */
  label: string;
}>;

export function toAssetFlowPoints(
  dailyBalances: readonly DailyBalancePoint[] | null | undefined,
): readonly AssetFlowPoint[] {
  if (!dailyBalances?.length) return [];

  // 한 달 안에 머무르면 "25일" 로 충분하다. 월을 넘으면 "8.25" 로 적어야
  // 8월 30일과 9월 30일이 축에서 겹치지 않는다.
  const months = new Set(dailyBalances.map((point) => point.date.slice(0, 7)));
  const spansMonths = months.size > 1;

  return dailyBalances.map((point, position) => ({
    balance: point.balance,
    date: point.date,
    index: position + 1,
    label: spansMonths ? monthDayLabel(point.date) : `${dayOfMonth(point.date)}일`,
  }));
}

function dayOfMonth(isoDate: string): number {
  const matched = /^\d{4}-\d{2}-(\d{2})/.exec(isoDate);
  return matched ? Number(matched[1]) : 0;
}

function monthDayLabel(isoDate: string): string {
  const matched = /^\d{4}-(\d{2})-(\d{2})/.exec(isoDate);
  return matched ? `${Number(matched[1])}.${Number(matched[2])}` : isoDate;
}
